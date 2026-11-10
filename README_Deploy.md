# 🚀 Guía de Despliegue en la Nube

## Proyecto: Salud al Toque

Esta guía documenta el despliegue en la nube de "Salud al Toque": base de datos PostgreSQL en AWS RDS, backend Spring Boot en AWS EC2 administrado con **Dokploy** (Docker Swarm + Traefik), IP fija con **Elastic IP**, dominio gratuito con **DuckDNS** y HTTPS automático con Let's Encrypt, y frontend en Vercel o AWS Amplify.

## 🧭 Arquitectura

```
Vercel (frontend, HTTPS)
        │  HTTPS
        ▼
https://saludaltoquebackend.duckdns.org   ──►  Elastic IP (puertos 80/443)
                                                    │
                                          EC2 (Ubuntu) + Dokploy
                                          Traefik + Let's Encrypt
                                                    │  puerto 8080
                                          Contenedor Spring Boot
                                                    │  puerto 5432
                                          AWS RDS PostgreSQL
                                          (solo accesible desde el Security Group de la EC2)
```

> **Por qué HTTPS:** un frontend en Vercel (HTTPS) no puede llamar a un backend en `http://IP:8080`. El navegador bloquea la petición (mixed content / CORS). El backend necesita un dominio con certificado.

---

## 💰 0. Costos y plan de AWS

- Con el **Free plan** de AWS los cargos se descuentan de los créditos y **no se cobran a la tarjeta**. El plan dura hasta 6 meses o hasta que se acaben los créditos; después la cuenta se cierra si no se pasa al Paid plan.
- En el Free plan solo se pueden lanzar tipos de instancia marcados como *Free tier eligible*.
- Costos aproximados (pueden cambiar, verifica en la calculadora de AWS):
  - Elastic IP / cualquier IPv4 pública: **0.005 USD/hora** (~3.65 USD/mes), esté en uso o no.
  - Disco gp3: ~0.08 USD por GB al mes.
  - Instancias detenidas no cobran cómputo, pero sus discos y sus IP sí.
- **Elimina (Terminate)** las instancias y las Elastic IP que ya no uses.

---

## 🖥️ 1. Servidor EC2

### 1.1 Crear la instancia

1. **EC2 → Launch instance**.
2. **Name:** `Backend Salud al Toque`.
3. **AMI:** Ubuntu Server 24.04 LTS, 64-bit (x86).
4. **Instance type:** mínimo **2 GB de RAM** (Dokploy + Postgres interno + Traefik + la JVM). En este despliegue se usó `c7i-flex.large` (4 GiB); `t3.small` o `t3.medium` también sirven si tu cuenta los permite.
5. **Key pair:** crea o elige una llave `.pem`.
6. **Storage:** **30 GiB, tipo gp3**.
   > ⚠️ **No dejes el valor por defecto de 8 GiB.** Con 8 GiB (≈6.8 GB útiles) el disco se llenó: la imagen de Dokploy y la de Postgres no cabían y el servicio de Dokploy quedó en `0/1` con el error `No such image`.
7. **Network settings → Security group (nuevo):** ver sección 1.2.
8. **Launch instance**.

### 1.2 Security Group de la EC2

Reglas de entrada (*Inbound*):

| Puerto | Tipo | Origen | Para qué |
| :---- | :---- | :---- | :---- |
| 22 | SSH | Tu IP (**My IP**) | Administración por SSH |
| 80 | HTTP | `0.0.0.0/0` | Traefik y validación de Let's Encrypt |
| 443 | HTTPS | `0.0.0.0/0` | API con HTTPS |
| 3000 | TCP personalizado | Tu IP (o `0.0.0.0/0` solo mientras configuras) | Panel de Dokploy |

Notas:
- **No hace falta abrir el 8080.** Traefik recibe el tráfico por 80/443 y lo reenvía al contenedor.
- Los cambios en un Security Group se aplican al instante, sin reiniciar la instancia.
- Los Security Groups no tienen costo. Si un grupo `launch-wizard-X` está en uso por una instancia (incluso detenida), AWS no deja borrarlo; `default` tampoco se puede borrar.
- Cierra el puerto 3000 cuando termines de configurar o acceda solo desde tu IP.

---

## 📌 2. Elastic IP (IP fija)

Sin Elastic IP, la IP pública cambia cada vez que se detiene y se inicia la instancia, y el dominio dejaría de apuntar al servidor.

1. **EC2 → Network & Security → Elastic IPs → Allocate Elastic IP address**.
2. Deja **Amazon's pool of IPv4 addresses**, sin tags, y pulsa **Allocate**.
3. Selecciona la IP creada → **Actions → Associate Elastic IP address**.
4. **Resource type:** Instance → elige tu instancia → deja la IP privada por defecto → **Associate**.
5. Anota la IP: se usa para SSH, para DuckDNS y para el panel de Dokploy.

> Una Elastic IP **sin asociar sigue cobrando**. Libérala (*Release*) si no la usas.

---

## 🛠️ 3. Instalar Dokploy

1. Conéctate por SSH:

```sh
chmod 400 salud-key.pem
ssh -i "salud-key.pem" ubuntu@<ELASTIC_IP>
```

2. Comprueba que hay espacio y memoria antes de instalar:

```sh
df -h /     # debe haber varios GB libres
free -h
```

3. Instala Dokploy (en un servidor limpio, con los puertos 80, 443 y 3000 libres):

```sh
curl -sSL https://dokploy.com/install.sh | sudo sh
```

4. Verifica que los servicios estén en `1/1`:

```sh
docker service ls
```

Debes ver `dokploy` y `dokploy-postgres` en `1/1`.

5. Entra al panel: `http://<ELASTIC_IP>:3000`, crea tu cuenta de administrador y, en el asistente inicial, pulsa **SKIP ALL** (las plantillas de ejemplo no se necesitan). Crea un **Project** (por ejemplo `Backend Salud al Toque`).

---

## 🗄️ 4. Base de Datos PostgreSQL en AWS RDS

### 4.1 Crear la instancia

1. **RDS → Databases → Create database → Standard create**.
2. **Engine:** PostgreSQL.
3. **Template:** Free tier (o el que permita tu cuenta).
4. **DB instance identifier:** `salud-al-toque-database`.
5. **Master username:** `postgres`. **Master password:** una contraseña segura (guárdala, no la subas al repositorio).
6. **Storage:** gp3 de 20 GiB, sin *Storage autoscaling* para evitar sobrecostos.
7. **Connectivity:**
   * **VPC:** la misma VPC de la EC2 (Default VPC).
   * **Public access:** **No** (el backend está en la misma VPC). Solo pon **Yes** si necesitas conectarte desde tu PC con DBeaver/pgAdmin; en ese caso limita el acceso a tu IP.
   * **VPC security group:** **Create new** → `rds-salud-sg`.
   * **Availability Zone:** *No preference* (idealmente la misma de la EC2).
   * No actives **RDS Proxy** (tiene costo extra).
8. **Additional configuration:**
   * **Initial database name:** `saludaltoquedatabase` (si lo dejas vacío, RDS no crea ninguna base y la app no tendrá a qué conectarse).
   * Encryption y automated backup: déjalos por defecto (1 día de retención alcanza para pruebas).
   * Monitoring avanzado / Performance Insights: desactivados.
9. **Create database** y espera a que el estado sea `Available`.
10. Copia el **Endpoint** (ej. `salud-al-toque-database.xxxx.us-east-2.rds.amazonaws.com`).

### 4.2 Security Group del RDS (¡paso crítico!)

Si falta esta regla, el backend no puede conectar y se cae al arrancar con `Connect timed out`.

1. En la pestaña **Connectivity & security** del RDS, abre el security group (`rds-salud-sg`).
2. **Edit inbound rules → Add rule**:

| Tipo | Puerto | Origen |
| :---- | :---- | :---- |
| PostgreSQL | 5432 | **El Security Group de la EC2** (selecciónalo por su ID `sg-...`, no por IP) |

3. **Save rules**.

Verificación desde la EC2:

```sh
nc -zv <TU_ENDPOINT_RDS> 5432
```

Debe responder `succeeded`. Si se queda colgado, la regla falta o está mal.

---

## 🌐 5. Dominio gratuito con DuckDNS

1. Entra a [duckdns.org](https://www.duckdns.org) e inicia sesión (GitHub o Google).
2. Crea un subdominio, por ejemplo `saludaltoquebackend` → `saludaltoquebackend.duckdns.org`.
3. En **current ip** escribe tu **Elastic IP** y pulsa **update ip**.
   > Por defecto DuckDNS pone la IP desde donde estás conectado (la de tu casa). Tiene que ser la de la EC2.
4. Verifica el DNS:

```sh
nslookup saludaltoquebackend.duckdns.org
```

Debe devolver tu Elastic IP.

> 🔒 **El token de DuckDNS es secreto.** Permite cambiar la IP de tu dominio. No lo compartas ni lo publiques; si se expone, regéneralo en la misma página.

---

## 🐳 6. Desplegar el Backend con Dokploy

### 6.1 Construir y subir la imagen a Docker Hub

Desde tu PC, en la carpeta del backend (ajusta el usuario y el nombre si cambian):

```sh
docker build -t faor6/salud-al-toque-backend:latest .
docker push faor6/salud-al-toque-backend:latest
```

Dokploy solo descarga la imagen ya construida: el servidor no compila nada y gasta menos disco y memoria.

### 6.2 Crear la aplicación en Dokploy

1. En tu proyecto: **Create Service → Application** (nombre: `Salud-al-toque-backend`).
2. Pestaña **General → Provider → Docker**:
   * **Docker Image:** `faor6/salud-al-toque-backend:latest`
   * **Registry URL / Username / Password:** vacíos si el repositorio de Docker Hub es público. Si es privado, usa tu usuario y un *access token* de Docker Hub (no tu contraseña).
   * **Save**.
   * *Build Type* no se usa con imágenes ya construidas.

### 6.3 Variables de entorno

Pestaña **Environment** (una por línea, formato `CLAVE=valor`, sin comillas ni `-e`):

```
DB_HOST=<TU_ENDPOINT_RDS>
DB_PORT=5432
DB_NAME=saludaltoquedatabase
DB_USER=postgres
DB_PASSWORD=<PASSWORD_RDS>
DDL_AUTO=update
JWT_SECRET=<GENERA_UNO_NUEVO>
JWT_EXPIRATION=3600000
NOTIFICATION_EMAIL_ENABLED=false
```

Notas:
- `DB_HOST` es solo el endpoint, sin `jdbc:` ni puerto.
- `DDL_AUTO=update` hace que Hibernate cree las tablas en la base nueva. Cuando todo funcione, cámbialo a `validate` o `none`.
- Genera un `JWT_SECRET` propio (por ejemplo `openssl rand -hex 32`) y **no lo subas a GitHub**.
- Después de guardar, hay que hacer **Deploy** o **Reload** para que el contenedor use las variables nuevas.

### 6.4 Dominio y HTTPS

Pestaña **Domains → Add Domain**:

| Campo | Valor |
| :---- | :---- |
| Host | `saludaltoquebackend.duckdns.org` |
| Path | `/` |
| Container Port | `8080` |
| HTTPS | Activado |
| Certificate Provider | Let's Encrypt |

Guarda y pulsa **Deploy**. En 1 o 2 minutos el backend queda en `https://saludaltoquebackend.duckdns.org` con candado. Let's Encrypt necesita el puerto 80 abierto y el DNS apuntando ya a la Elastic IP.

### 6.5 Verificar

En Dokploy: pestaña **Deployments / Logs**, debe aparecer `Started Sss001Application in X seconds`. Desde tu PC:

```sh
curl https://saludaltoquebackend.duckdns.org/specialties
```

### 6.6 Alternativa sin Dokploy (sin HTTPS automático)

```sh
docker run -d \
  --name salud-backend \
  -p 8080:8080 \
  -e DB_HOST="<TU_ENDPOINT_RDS>" \
  -e DB_PORT="5432" \
  -e DB_NAME="saludaltoquedatabase" \
  -e DB_USER="postgres" \
  -e DB_PASSWORD="<PASSWORD_RDS>" \
  -e JWT_SECRET="<GENERA_UNO_NUEVO>" \
  -e JWT_EXPIRATION="3600000" \
  -e NOTIFICATION_EMAIL_ENABLED="false" \
  --restart unless-stopped \
  faor6/salud-al-toque-backend:latest
```

Aquí hay que abrir el puerto 8080 en el Security Group y el backend queda solo en HTTP, por lo que un frontend en HTTPS no podrá consumirlo.

---

## 🖼️ 7. Despliegue del Frontend Web

### Opción A: Vercel (recomendado)

1. Sube tu código a GitHub e importa el repositorio en [Vercel](https://vercel.com/) (**Add New → Project**).
2. Configuración:
   * **Framework Preset:** `Vite`.
   * **Root Directory:** `FrontendWeb`.
   * **Build Command:** `npm run build`. **Output Directory:** `dist`.
3. **Environment Variables:**
   * `VITE_API_URL` = `https://saludaltoquebackend.duckdns.org`
4. **Deploy**.
5. El archivo `FrontendWeb/vercel.json` permite que rutas como `/login` o `/dashboard` funcionen al recargar.

> Vite escribe `VITE_API_URL` **al compilar**. Si cambias la variable, haz **Redeploy**; si no, el frontend sigue llamando a la URL anterior.

### Opción B: AWS Amplify

1. En AWS Amplify: **New app → Host web app** → GitHub → tu repositorio y la rama `main`.
2. **Monorepo folder / Root:** `FrontendWeb`.
3. Configuración de build (`amplify.yml`):

```
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

4. **Environment Variables:** `VITE_API_URL` = `https://saludaltoquebackend.duckdns.org`.
5. **Rewrites and redirects** (regla para Single Page Application):
   * **Source address:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   * **Target address:** `/index.html`
   * **Type:** `200 (Rewrite)`
6. **Save and Deploy**.

---

## 🔄 8. Configuración de CORS en el Backend

El backend debe permitir el origen exacto desde donde se abre el frontend. Configuración usada en `SecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "https://salud-al-toque-proy.vercel.app",
            "https://salud-al-toque-proy*.vercel.app"   // URLs de preview de Vercel
    ));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

Importante:
- Con Spring Security hay que activarlo: `http.cors(Customizer.withDefaults())`.
- Los comodines (`*`) solo funcionan con `setAllowedOriginPatterns`, **no** con `setAllowedOrigins`.
- Evita `https://*.vercel.app` con `allowCredentials(true)`: permitiría a cualquier proyecto de Vercel llamar a tu API.
- Cada cambio de CORS requiere reconstruir la imagen, subirla a Docker Hub y hacer **Deploy** en Dokploy.

---

## 🧯 9. Solución de problemas

| Síntoma | Causa probable | Qué hacer |
| :---- | :---- | :---- |
| `dokploy 0/1` y `No such image` | Disco lleno (8 GiB) | Ampliar el volumen EBS a 30 GiB y reiniciar el servicio: `docker service update --force dokploy` |
| `502 Bad Gateway` en el dominio | El contenedor no está corriendo | `docker service ls` (debe ser `1/1`), luego `docker service ps <servicio> --no-trunc` y `docker service logs <servicio>` |
| En los logs: `Connect timed out` hacia el RDS | El Security Group del RDS no permite el 5432 desde la EC2 | Agregar la regla de la sección 4.2 |
| `password authentication failed` | `DB_USER` o `DB_PASSWORD` incorrectos | Corregirlos en Environment y hacer Deploy |
| `database "..." does not exist` | `DB_NAME` incorrecto | Debe ser `saludaltoquedatabase` |
| `UnknownHostException` | `DB_HOST` vacío o mal escrito | Poner solo el endpoint del RDS |
| `Unable to determine Dialect without JDBC metadata` | Consecuencia de no poder conectar a la base | Resolver la conexión al RDS (revisar los casos anteriores) |
| El navegador muestra `CORS Missing Allow Origin` | Casi siempre es un **502** disfrazado (el 502 lo genera Traefik y no lleva cabeceras CORS), o el origen no está en la lista de CORS | Probar con `curl` (abajo) |
| Let's Encrypt no emite el certificado | El DNS aún no apunta a la Elastic IP o el puerto 80 está cerrado | `nslookup` del dominio y revisar el Security Group |
| El frontend llama a `IP:8080` | `VITE_API_URL` vieja | Cambiarla en Vercel y hacer **Redeploy** |

Prueba de CORS con `curl` (cambia el origen por el que usas):

```sh
curl -i -X OPTIONS https://saludaltoquebackend.duckdns.org/signin \
  -H "Origin: https://salud-al-toque-proy.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

- `502`: backend caído → revisar logs.
- `200` sin `access-control-allow-origin`: el origen no está permitido en CORS.
- `200` con `access-control-allow-origin`: CORS correcto.

Comandos útiles en la EC2:

```sh
docker service ls
docker service ps <servicio> --no-trunc
docker service logs --tail 100 <servicio>
df -h /
```

---

## ✅ 10. Credenciales de Prueba

| Actor | Correo | Contraseña | Rol en Sistema | Vistas Asignadas |
| :---- | :---- | :---- | :---- | :---- |
| **Paciente** | `luis@gmail.com` | `123456` | `PATIENT` | Dashboard Paciente, Directorio, Mis Citas, Favoritos |
| **Profesional / Médico** | `carlos@gmail.com` | `123456` | `PROFESSIONAL` | Dashboard Médico, Gestión y Aprobación de Citas |
| **Profesional / Médico** | `maria@gmail.com` | `123456` | `PROFESSIONAL` | Dashboard Médico, Gestión y Aprobación de Citas |
| **Administrador** | `admin@gmail.com` | `123456` | `ADMIN` | Panel Admin General, Supervisión y Eliminación de Cuentas |

> Si la base de datos del RDS es nueva, estos usuarios solo existen si la aplicación los crea al iniciar. Si no, regístralos desde la pantalla de registro. Son credenciales de demostración: no las uses en producción.
