// controllers/authController.js
const sql = require('mssql');
const { pool, poolConnect } = require('../models/database');
const Swal = require('sweetalert2');
const { getphongban } = require('./createtask');
const { render } = require('ejs');
const { getnhanvien } = require('./nhanvien');

// Login function
async function login(req, res) {
    const { username, password } = req.body;
    try {
        await poolConnect;
        const request = pool.request();
        const result = await request
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM NhanVien WHERE IdNVien = @username and MatKhau = dbo.MaHoaMk(' + password + ')');

        if (result.recordset.length > 0) {
            req.session.user = result.recordset[0];
            res.redirect('/index');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error('Error during login process:', err);
        res.status(500).send('Server error');
    }
}

// Register function
async function register(req, res) {
    const { username, password, phongban } = req.body;
    if (phongban !== '') {
        try {
            await poolConnect;
            const request = pool.request();
            const result = await request.query(`select * from NhanVien where IdNVien = '${username}'`);
            if (result.recordset.length === 0) {
                await request.query(`insert into NhanVien (IdNVien, MatKhau, PhongBan) values ('${username}', dbo.MaHoaMk('${password}'), ${phongban})`);
                const data = await getnhanvien(req.session.user.PhongBan, '');
                res.render('qlnhanvien', { user: req.session.user, data });
            }
            else {
                const data = await getphongban();
                res.render('register', { user: req.session.user, data, error: 'Tên đăng nhập đã tồn tại' });
            }
        }
        catch (err) {
            console.error('Error during register process:', err);
            res.status(500).send('Server error');
        }
    }
    else {
        const data = await getphongban();
        res.render('register', { user: req.session.user, data, error: 'Vui lòng chọn phòng ban' });
    }
}


// update password function
async function updatePassword(req, res) {
    const { expassword, password, password2 } = req.body;
    const id = req.session.user.IdNVien;
    console.log(id);
    try {
        await poolConnect;
        const request = pool.request();
        const result = await request.query(`SELECT * FROM NhanVien WHERE IdNVien = '${id}' and MatKhau = dbo.MaHoaMk('${expassword}')`);
        if (result.recordset.length > 0) {
            if (password === password2) {
                await request.query(`UPDATE NhanVien SET MatKhau = dbo.MaHoaMk('${password}') WHERE IdNVien = '${id}'`);
                res.redirect('/');
            } else {
                res.json({ success: false, message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
            }
        }
    }
    catch (err) {
        console.error('Error during password update process:', err);
        res.status(500).send('Server error');
    }
}

module.exports = { login, register, updatePassword };
