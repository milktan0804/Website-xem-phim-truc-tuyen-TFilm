const sql = require('mssql');
const { pool, poolConnect } = require('../models/database');
const { getphongban } = require('../controllers/createtask');

async function taophongban(req, res) {
    const { tenphongban } = req.body;
    try {
        const pool = await poolConnect;
        const request = pool.request();
        await request
            .query(`INSERT INTO PhongBan (TenPB) VALUES (N'${tenphongban}'));
                    SELECT SCOPE_IDENTITY() AS IdPB`);
            const data = await getphongban();
        res.render('qlphongban', { user: req.session.user, data });
    }
    catch (err) {
        console.log(err);
    }
}

// update phongban
async function updatephongban(req, res) {
    const { tenphongban, idtruongphong } = req.body;
    try {
        const pool = await poolConnect;
        const request = pool.request();
        await request
            .query(`UPDATE PhongBan SET TenPB = N'${tenphongban}' and IdTruongPhong = ${idtruongphong}  WHERE IdPB = @idphongban`);
            const data = await getphongban();
        res.render('qlphongban', { user: req.session.user, data });
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = { taophongban };