-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: calificaciones_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auditoria_eventos`
--

DROP TABLE IF EXISTS `auditoria_eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria_eventos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evento` varchar(255) NOT NULL,
  `usuario_correo` varchar(255) DEFAULT NULL,
  `fecha_evento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_eventos`
--

LOCK TABLES `auditoria_eventos` WRITE;
/*!40000 ALTER TABLE `auditoria_eventos` DISABLE KEYS */;
INSERT INTO `auditoria_eventos` VALUES (1,'Creó certificado: CERT-001','corredor.demo@empresa.cl','2025-11-08 19:15:57'),(2,'Creó certificado: CERT-042','corredor.demo@empresa.cl','2025-11-08 19:17:04'),(3,'Certificado CERT-001 aprobado por auditor.demo@empresa.cl','auditor.demo@empresa.cl','2025-11-08 21:14:49'),(4,'Certificado CERT-042 rechazado por auditor.demo@empresa.cl','auditor.demo@empresa.cl','2025-11-08 22:04:51'),(5,'Creó certificado: CERT-004','corredor@empresa.cl','2025-11-09 00:52:15'),(6,'Creó certificado: CERT-102 con factor: 10.009000','corredor@empresa.cl','2025-11-09 01:03:59'),(7,'Certificado CERT-004 fue aprobado por auditor@empresa.cl','auditor@empresa.cl','2025-11-09 01:12:23'),(8,'Certificado CERT-102 fue rechazado por auditor@empresa.cl','auditor@empresa.cl','2025-11-09 01:12:29'),(9,'Creó certificado: CERT-2345 con factor: 0.040000','corredor@empresa.cl','2025-11-09 01:13:28'),(10,'Certificado CERT-2345 fue aprobado por auditor@empresa.cl','auditor@empresa.cl','2025-11-09 01:13:41'),(11,'Creó certificado: CERT-2241 con factor: 120.000000','corredor@empresa.cl','2025-11-09 01:18:30'),(12,'Certificado CERT-2241 fue aprobado por auditor@empresa.cl','auditor@empresa.cl','2025-11-09 01:18:55');
/*!40000 ALTER TABLE `auditoria_eventos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-08 19:23:47
