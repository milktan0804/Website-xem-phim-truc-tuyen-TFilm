const sql = require('mssql');
const { pool, poolConnect } = require('../models/database');

async function getsoluongnhiemvu() {
    let nhiemvu = new Array(4);
    try {
        await poolConnect;
        let request = pool.request();
        let result = await request
            .query('select count(*) as count from NhiemVu');
        if (result.recordset.length > 0) {
            nhiemvu[0] = result.recordset[0].count; 
        }

        for (let i = 2; i <= 4; i++) {
            result = await request
                .query('SELECT count(*) as count FROM NhiemVu WHERE TinhTrangNV =' + i);
            if (result.recordset.length > 0) {
                nhiemvu[i-1] = result.recordset[0].count;
            }
        }
        return nhiemvu;
    } catch (err) {
        console.error('Error during getsoluongnhiemvu process:', err);
    }
}

async function getnhiemvu(pb, tt) {
    try {
        await poolConnect;
        let request = pool.request();
        if(pb === '' && tt === '') {
            result = await request
                .query('select top 10 * from NhiemVu nv, PhongBan pb where nv.PhongBan = pb.IdPB ');
        }
        else if(pb === '' && tt !== '') {
            result = await request
                .query('select top 10 * from NhiemVu nv, PhongBan pb where nv.PhongBan = pb.IdPB and TinhTrangNV = ' + tt);
        }
        else if(pb !== '' && tt === '') {
            result = await request
                .query('select top 10 * from NhiemVu nv, PhongBan pb where nv.PhongBan = pb.IdPB and PhongBan = ' + pb);
        }
        else {
            result = await request
                .query('select top 10 * from NhiemVu nv, PhongBan pb where nv.PhongBan = pb.IdPB and PhongBan = ' + pb + ' AND TinhTrangNV = ' + tt);
        }
        return result.recordset;
    } catch (err) {
        console.error('Error during getnhiemvu process:', err);
    }
}
module.exports = { getsoluongnhiemvu, getnhiemvu };