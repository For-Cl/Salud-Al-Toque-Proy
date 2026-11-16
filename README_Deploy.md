# 🚀 Salud al Toque — Guía de Despliegue

## Arquitectura en Producción

```
   Frontend Web (Vercel, HTTPS)
           │
           ▼
   https://saludaltoquebackend.duckdns.org
           │
   EC2 (Ubuntu) + Dokploy
   Traefik + Let's Encrypt (HTTPS automático)
           │  puerto 8080
   Contenedor Spring Boot (Docker)
           │  puerto 5432
   AWS RDS PostgreSQL
   (accesible solo desde la EC2)
```

> **¿Por qué HTTPS?** Un frontend en Vercel (HTTPS) no puede llamar a un backend HTTP. El navegador bloquea la petición por *mixed content*. El backend necesita un dominio con certificado.

---

## URLs en Producción

| Servicio | URL |
|---|---|
| **Backend API** | `https://saludaltoquebackend.duckdns.org` |
| **Frontend Web** | Vercel (configurar `VITE_API_URL` apuntando al backend) |
| **React Native** | Configurar `API_BASE_URL` en `src/api/client.ts` |

---

## 1. Servidor EC2

1. **EC2 → Launch instance** → Ubuntu Server 24.04 LTS, 64-bit (x86).
2. **Instance type:** c7i-flex.large, mínimo 2 GB de RAM (Dokploy + Traefik + JVM).
3. **Storage:** 30 GiB gp3.
4. **Key pair:** crear o elegir una llave `.pem`.

### Security Group

| Puerto | Tipo | Origen | Para qué |
|---|---|---|---|
| 22 | SSH | Tu IP | Administración |
| 80 | HTTP | `0.0.0.0/0` | Traefik + Let's Encrypt |
| 443 | HTTPS | `0.0.0.0/0` | API con HTTPS |
| 3000 | TCP | Tu IP | Panel de Dokploy (cerrar al terminar) |
| 8080 | TCP |`0.0.0.0/0` | API con el puerto del backend abierto |

---

## 2. Elastic IP

Sin Elastic IP, la IP pública cambia al reiniciar la instancia y el dominio deja de apuntar.

1. **EC2 → Elastic IPs → Allocate** → Asociar a la instancia.
2. Anotar la IP para SSH, DuckDNS y Dokploy.

> Una Elastic IP sin asociar sigue cobrando. Libérarla si no se usa.

---

## 3. Dokploy

```bash
ssh -i "salud-key.pem" ubuntu@<ELASTIC_IP>
curl -sSL https://dokploy.com/install.sh | sudo sh
docker service ls    # dokploy y dokploy-postgres deben estar en 1/1
```

Acceder al panel en `http://<ELASTIC_IP>:3000`, crear cuenta de administrador y un proyecto.

---

## 4. Base de Datos (AWS RDS)

1. **RDS → Create database** → PostgreSQL, Free tier.
2. **DB instance identifier:** `salud-al-toque-database`.
3. **Initial database name:** `saludaltoquedatabase`.
4. **Public access:** No (backend en la misma VPC).

### Security Group del RDS

| Tipo | Puerto | Origen |
|---|---|---|
| PostgreSQL | 5432 | Security Group de la EC2 (`sg-...`) |



---

## 5. Dominio DuckDNS

1. Crear subdominio `saludaltoquebackend` en [duckdns.org](https://www.duckdns.org).
2. En **current ip** poner la **Elastic IP** de la EC2.
3. Verificar: `nslookup saludaltoquebackend.duckdns.org` → debe devolver la Elastic IP.

> El token de DuckDNS es secreto. Permite cambiar la IP del dominio.

---

## 6. Desplegar el Backend

### Construir y subir imagen

```bash
docker build -t faor6/salud-al-toque-backend:latest .
docker push faor6/salud-al-toque-backend:latest
```

### Configurar en Dokploy

1. **Create Service → Application** → Provider: Docker → Image: `faor6/salud-al-toque-backend:latest`.

2. **Environment Variables:**
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
.
.
.
```

3. **Domains → Add Domain:**

| Campo | Valor |
|---|---|
| Host | `saludaltoquebackend.duckdns.org` |
| Path | `/` |
| Container Port | `8080` |
| HTTPS | Activado |
| Certificate | Let's Encrypt |

4. **Deploy**. En ~2 minutos el backend queda en `https://saludaltoquebackend.duckdns.org`.

---

## 7. Desplegar el Frontend Web

### Vercel

1. Importar repositorio en [Vercel](https://vercel.com/).
2. **Framework:** Vite · **Root Directory:** `FrontendWeb` · **Output:** `dist`.
3. **Variable de entorno:** `VITE_API_URL` = `https://saludaltoquebackend.duckdns.org`.
4. **Deploy**.

> `vercel.json` en `FrontendWeb/` permite que rutas como `/login` funcionen al recargar.
---

## 8. CORS del Backend

El backend debe permitir el origen del frontend. Configuración en `SecurityConfig.java`:

```java
configuration.setAllowedOriginPatterns(List.of(
    "http://localhost:*",
    "https://salud-al-toque-proy.vercel.app",
    "https://salud-al-toque-proy*.vercel.app"
));
```

Cada cambio de CORS requiere reconstruir la imagen y redesplegar en Dokploy.
