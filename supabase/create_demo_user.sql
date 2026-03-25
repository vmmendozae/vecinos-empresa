-- =============================================
-- CREAR USUARIO DE PRUEBA
-- Ejecutar en Supabase SQL Editor > Authentication
-- O crear manualmente desde Authentication > Users > Add User
-- =============================================

-- Opción 1: Desde el SQL editor (usa la función interna de Supabase)
SELECT auth.uid(); -- Verifica que tienes acceso

-- Opción 2 (RECOMENDADA): Ir a Supabase Dashboard
-- → Authentication → Users → Add user
-- Email: admin@sportlife.com.co
-- Password: SportLife2024!
-- ✅ Auto Confirm User: activado

-- Luego ejecutar seed.sql para cargar los datos demo
