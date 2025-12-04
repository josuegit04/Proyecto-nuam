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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_eventos`
--

LOCK TABLES `auditoria_eventos` WRITE;
/*!40000 ALTER TABLE `auditoria_eventos` DISABLE KEYS */;
INSERT INTO `auditoria_eventos` VALUES (1,'Carga Masiva: 2 certificados subidos exitosamente.','corredor@empresa.cl','2025-11-23 23:52:38'),(2,'Auditor cambió estado de CERT-TEST-01 a APROBADO','admin@empresa.cl','2025-11-23 23:53:11'),(3,'Eliminó certificado: CERT-TEST-01','admin@empresa.cl','2025-11-23 23:53:17'),(4,'Eliminó certificado: CERT-TEST-02','admin@empresa.cl','2025-11-23 23:53:20'),(5,'Carga Masiva: 2 certificados subidos.','corredor@empresa.cl','2025-12-04 04:08:45'),(6,'Editó usuario ID: 3','admin@empresa.cl','2025-12-04 04:09:26'),(7,'Editó usuario ID: 3','corredor@empresa.cl','2025-12-04 04:09:43'),(8,'Auditor cambió estado de CERT-TEST-01 a APROBADO','admin@empresa.cl','2025-12-04 04:10:08'),(9,'Eliminó certificado: CERT-TEST-02','admin@empresa.cl','2025-12-04 04:10:19'),(10,'Creó usuario nuevo: melapela@empresa.cl','admin@empresa.cl','2025-12-04 04:11:30'),(11,'Eliminó usuario ID: 5','admin@empresa.cl','2025-12-04 04:12:10'),(12,'Editó certificado: CERT-TEST-01','admin@empresa.cl','2025-12-04 04:17:34'),(13,'Creó certificado manual: 1415521','corredor@empresa.cl','2025-12-04 05:05:24'),(14,'Editó certificado: 1415521','admin@empresa.cl','2025-12-04 05:17:41'),(15,'Auditor cambió estado de 1415521 a APROBADO','auditor@empresa.cl','2025-12-04 05:39:42');
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

-- Dump completed on 2025-12-03 23:47:32
