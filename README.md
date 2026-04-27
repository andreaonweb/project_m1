# 🌸 Sakura Pâtisserie · 桜パティスリー

Aplicación web de pastelería japonesa artesanal, construida con **Angular 17+** usando la API moderna de señales (Signals).

---

## ✨ Características

- Catálogo de productos con tarjetas interactivas
- Carrito de compra reactivo con panel lateral deslizante
- Gestión de cantidades por producto (añadir, disminuir, eliminar)
- Autenticación de usuario (login / logout)
- Navegación entre páginas con Angular Router
- Arquitectura basada en **Signals** y **computed values**

---

## 🛠️ Tecnologías

| Tecnología | Versión |
|---|---|
| Angular | 17+ |
| TypeScript | 5+ |
| Angular Signals | API nativa |
| Angular Router | Standalone |
| SCSS | — |

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── product.model.ts       # Interfaz Product y CartItem
│   │   └── services/
│   │       ├── auth.service.ts        # Autenticación
│   │       ├── cart.service.ts        # Carrito reactivo con Signals
│   │       └── counter.service.ts     # Contador de práctica
│   ├── features/
│   │   ├── home/                      # Página de inicio
│   │   ├── menu/                      # Catálogo de productos
│   │   └── about/                     # Página nosotras
│   └── shared/
│       └── components/
│           ├── navbar/                # Navbar + panel lateral del carrito
│           └── product-card/          # Tarjeta de producto
```

---

## 🚀 Instalación y uso

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sakura-patisserie.git
cd sakura-patisserie

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```

Abre el navegador en `http://localhost:4200`

---

## 🛒 CartService

El carrito gestiona el estado con Signals. Cada producto almacena su cantidad, evitando duplicados:

```typescript
add(product)       // añade 1 unidad, o incrementa si ya existe
remove(id)         // descuenta 1 unidad, elimina si llega a 0
removeAll(id)      // elimina el producto completamente
getItems()         // devuelve ReadonlySignal<CartItem[]>
```

---

## 🌸 Páginas

| Ruta | Descripción |
|---|---|
| `/home` | Bienvenida y características de la pastelería |
| `/menu` | Catálogo de productos con carrito integrado |
| `/about` | Información sobre el equipo |
| `/auth` | Inicio de sesión |

---

## 📝 Licencia

Proyecto personal de aprendizaje · hecho con 🍡 y mucho matcha.
