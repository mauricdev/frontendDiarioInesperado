# Usamos una imagen oficial de Node con la versión 20
FROM node:24-alpine

# Creamos la carpeta donde vivirá nuestro código dentro del contenedor
WORKDIR /app

# Copiamos solo los archivos de dependencias primero (esto hace que Docker sea más rápido)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código de Angular al contenedor
COPY . .

# Exponemos el puerto de Angular
EXPOSE 4200

# El comando para levantar Angular asegurando que se exponga hacia afuera del contenedor
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]