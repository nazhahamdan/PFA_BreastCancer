# ÉTAPE 1 : Compilation du JAR (Image lourde avec Maven et le JDK)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Optimisation : On copie le pom.xml et on télécharge les dépendances d'abord
#go-offline telecharge tous les dep une fois et les mettre a cote

COPY pom.xml .
RUN mvn dependency:go-offline -B
# On copie le code source et on compile le projet (génère le fichier JAR)
#passer les tests unitaires puisqu il va ralentire la compilation
COPY src ./src
RUN mvn clean package -DskipTests

# ÉTAPE 2 : Image finale (Ultra légère, contient uniquement le JRE et le JAR)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# On récupère UNIQUEMENT le fichier JAR compilé de l'étape précédente
COPY --from=build /app/target/*.jar app.jar

# Port par défaut de Spring Boot
EXPOSE 8080

# Commande exacte pour démarrer votre API Spring Boot
CMD ["java", "-jar", "app.jar"]
