// Backend/src/controllers/authController.js
// ¡DEUDA TÉCNICA RESUELTA! Ahora usamos hashes para las contraseñas.

const db = require('../db');
const bcrypt = require('bcryptjs'); // <-- 1. Importamos bcryptjs
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscamos al usuario por su email, incluyendo su rol y departamento
        const result = await db.query(
            `SELECT u.id, u.nombre, u.email, u.password_hash, r.nombre_rol, d.nombre AS nombre_departamento
             FROM usuarios u 
             JOIN roles r ON u.id_rol = r.id
             JOIN departamento d ON u.id_departamento = d.id
             WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas (usuario no encontrado)' });
        }

        const user = result.rows[0];

        // 2. COMPARACIÓN SEGURA CON BCRYPT
        // Comparamos la contraseña que nos llega con el hash guardado en la BD
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas (contraseña incorrecta)' });
        }

        // 3. Si todo es correcto, crear el token JWT
        const payload = {
            id: user.id,
            rol: user.nombre_rol,
            departamento: user.nombre_departamento
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 4. Enviar el token y la información COMPLETA del usuario al cliente
        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                rol: user.nombre_rol,
                departamento: user.nombre_departamento
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Función para registrar un nuevo usuario
const register = async (req, res) => {
    const { nombre, email, password, id_rol, id_departamento, adminCode } = req.body;

    try {
        // 1. Verificar si el email ya está en uso
        const userExists = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

        // 2. Verificar el código de administrador si es necesario
        if (parseInt(id_rol) === 1 && parseInt(id_departamento) === 1) {
            if (adminCode !== process.env.ADMIN_CODE) {
                return res.status(403).json({ message: 'Código de administrador incorrecto.' });
            }
        }

        // 3. HASHEAR LA CONTRASEÑA ANTES DE GUARDARLA
        // Generamos un hash seguro de la contraseña. El número 10 es el "salt rounds".
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Insertar el nuevo usuario en la base de datos con la contraseña hasheada
        const newUser = await db.query(
            'INSERT INTO usuarios (nombre, email, password_hash, id_rol, id_departamento, fecha_creacion) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, nombre, email',
            [nombre, email, hashedPassword, id_rol, id_departamento] // <-- Usamos el hash
        );

        res.status(201).json({ message: 'Usuario creado exitosamente.' });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error del servidor al crear el usuario.' });
    }
};

module.exports = { login, register };