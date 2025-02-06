const sql = require('mssql');
const { pool, poolConnect } = require('../models/database');
const { getsoluongnhiemvu } = require('../controllers/getnhiemvu');

async function assigned(req, res) {
    const { tennv, noidung, ngaybd, ngaykt, phongban } = req.body;
    const files = req.files;

    try {
        // Connect to the database
        const pool = await poolConnect;
        const request = pool.request();
        // GET IDTRUONGPHONG
        const headResult = await request
            .input('phongbanid', sql.Int, phongban)
            .query('SELECT IdTruongPhong FROM PhongBan WHERE IdPB = @phongbanid');

        const IdTruongPhong = headResult.recordset[0]?.IdTruongPhong;

        if (!IdTruongPhong) {
            throw new Error('TruongPhong not found for the given PhongBan');
        }

        // Insert task into NhiemVu
        const result = await request
            .input('tennv', sql.NVarChar, tennv)
            .input('noidung', sql.NVarChar, noidung)
            .input('ngaybd', sql.Date, ngaybd)
            .input('ngaykt', sql.Date, ngaykt)
            .input('phongban', sql.Int, phongban)
            .query(`INSERT INTO NhiemVu (TenNV, NoiDungNV, NgayBatDauNV, NgayKetThucNV, TinhTrangNV, PhongBan) VALUES (@tennv, @noidung, @ngaybd, @ngaykt, 1, @PhongBan);
                    SELECT SCOPE_IDENTITY() AS IdNV`);

        const IdNV = result.recordset[0].IdNV;

        // Insert files into TaiLieuNV
        for (const file of files) {
            await pool.request()
                .input('IdNV', sql.Int, IdNV)
                .input('TenTL', sql.NVarChar, file.originalname)
                .input('Link', sql.NVarChar, file.path)
                .query('INSERT INTO TaiLieuNV (IdNV, TenTL, Link) VALUES (@IdNV, @TenTL, @Link)');
        }

        //INSERT NOTIFICATION - IDTRUONGPHONG
        await pool.request()

            .input('IdNVien', sql.NVarChar, IdTruongPhong)
            .input('NoiDung', sql.NVarChar, `Có nhiệm vụ mới: ${tennv}`)
            .input('NgayTao', sql.Date, new Date())
            .query('INSERT INTO ChangeLog (IdNV, IdPB, IdNVien, NoiDung, NgayTao) VALUES (' + IdNV + ', ' + phongban + ', @IdNVien, @NoiDung, @NgayTao)');

        let thongbao = [];
        if (req.session && req.session.user && req.session.user.IdNVien) {
            // Fetch notifications for the current user
            const notificationsResult = await pool.request()
                .input('IdNVien', sql.VarChar, req.session.user.IdNVien)
                .query('SELECT NoiDung FROM ChangeLog WHERE IdNVien = @IdNVien ORDER BY NgayTao DESC');

            thongbao = notificationsResult.recordset;
        } else {
            console.log('User session or IdNVien not found');
        }

        let nhiemvu = await getsoluongnhiemvu();
        res.render('index', { user: req.session.user || {}, nhiemvu, thongbao });
    } catch (err) {
        console.error('Error saving files to database:', err);
        res.status(500).send('An error occurred while saving files.');
    }
}

async function getphongban(req, res) {
    try {
        const pool = await poolConnect;
        const request = pool.request();
        const result = await request.query('SELECT * FROM PhongBan');
        return result.recordset;
    } catch (err) {
        console.error('Error getting PhongBan:', err);
        res.status(500).send('An error occurred while getting PhongBan.');
    }
}

module.exports = { assigned, getphongban };