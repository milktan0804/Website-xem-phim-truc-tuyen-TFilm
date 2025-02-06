const sql = require('mssql');
const { pool, poolConnect } = require('../models/database');
const { query } = require('express');
const { default: Swal } = require('sweetalert2');

async function getnhanvien(pb, search) {
    try {
        Swal.fire("Mật khẩu không trùng khớp");
        const pool = await poolConnect;
        const request = pool.request();
        if (search === '') {
            if (pb === 1) { result = await request.query('SELECT * FROM NhanVien'); }
            else { result = await request.query('SELECT * FROM NhanVien where PhongBan = ' + pb); }
        }
        else {
            if (pb === 1) { result = await request.query(`SELECT * FROM NhanVien where IdNVien like '${search}'`); }
            else { result = await request.query(`SELECT * FROM NhanVien where PhongBan = ${pb} and IdNVien like '${search}'`) }
        }
        return result.recordset;
    }
    catch (err) {
        console.log(err);
    }
}

async function search(req, res) {
    if (req.session.user) {
        const query = '%' + req.body.tknvien + '%' || '';
        const data = await getnhanvien(req.session.user.PhongBan, query);
        res.render('qlnhanvien', { user: req.session.user, data });
    } else {
        res.redirect('/');
    }
}

async function getnhanvienpb(pb) {
    try {
        const pool = await poolConnect;
        const request = pool.request();
        if (pb === '') { result = await request.query('SELECT * FROM NhanVien'); }
        else {result = await request.query('SELECT * FROM NhanVien where PhongBan = ' + pb);}
        return result.recordset;
    }
    catch (err) {
        console.log(err);
    }
}
module.exports = { getnhanvien, search, getnhanvienpb };