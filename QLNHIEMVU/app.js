const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const sql = require('mssql');
const { pool, poolConnect } = require('./models/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const { login, register, updatePassword } = require('./controllers/authController');
const { assigned, getphongban } = require('./controllers/createtask');
const { get } = require('http');
const { getsoluongnhiemvu, getnhiemvu } = require('./controllers/getnhiemvu');
const { taophongban } = require('./controllers/phongban');
const { getnhanvien, search, getnhanvienpb } = require('./controllers/nhanvien');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'i am RAM 512 MB', // Thay thế bằng một chuỗi bảo mật
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Đặt là true nếu bạn sử dụng HTTPS
}));

//server static files from - public
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
//GET LOGIN register
app.get('/', (req, res) => {
    res.render('login')
});

app.get('/register', async (req, res) => {
    if (req.session.user) {
        const data = await getphongban();
        res.render('register', {user: req.session.user, data, error: ''});
    }
    else {
        res.redirect('/');
    }
});

// POST LOGIN REGISTER
app.post('/login', login);
app.post('/updatepassword', updatePassword)
app.post('/register', register);

//DASHBOARD

app.get('/index', async (req, res) => {
    if (req.session.user) {
        let nhiemvu = await getsoluongnhiemvu();
        let thongbao = [];
        if (req.session && req.session.user && req.session.user.IdNVien) {
            const request = pool.request();
            const notificationsResult = await request
                .input('IdNVien', sql.VarChar, req.session.user.IdNVien)
                .query('SELECT NoiDung FROM ChangeLog WHERE IdNVien = @IdNVien ORDER BY NgayTao DESC');

            thongbao = notificationsResult.recordset;
            req.session.thongbao = thongbao; //luu thông báo vào session
        }
        res.render('index', { user: req.session.user, nhiemvu, thongbao });
    } else {
        res.redirect('/');
    }
});
//create-task
app.get('/create-task', async (req, res) => {
    if (req.session.user) {
        const data = await getphongban();
        res.render('taonhiemvu', { user: req.session.user, files: [], data, thongbao: req.session.thongbao });
    } else {
        res.redirect('/');
    }
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public/uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/assigned', upload.array('files', 10), assigned);

//qlnhiemvu
app.get('/qlnhiemvu', async (req, res) => {
    if (req.session.user) {
        const currentPage = parseInt(req.query.page) || 1;
        const totalPages = 5;
        const data = await getphongban();
        const data1 = await getnhiemvu('', '');
        res.render('qlnhiemvu', { user: req.session.user, data, data1, currentPage, totalPages });
    } else {
        res.redirect('/');
    }
});
app.post('/thongtinnhiemvu', async (req, res) => {
    if (req.session.user) {
        const { phongban, trangthai } = req.body;
        const data = await getphongban();
        const data1 = await getnhiemvu(phongban, trangthai);
        res.render('qlnhiemvu', { user: req.session.user, data, data1 });
    } else {
        res.redirect('/');
    }
});

//qlphongban
app.get('/qlphongban', async (req, res) => {
    if (req.session.user) {
        const data = await getphongban();
        let data1 = await getnhanvienpb('');
        res.render('qlphongban', { user: req.session.user, data, data1 });
    } else {
        res.redirect('/');
    }
});

app.post('/qlphongban', async (req, res) => {
    if (req.session.user) {
        const data = await getphongban();
        const pb = req.body.idpb;
        let data1 = await getnhanvienpb(pb);
        res.render('qlphongban', { user: req.session.user, data, data1 });
    } else {
        res.redirect('/');
    }
});

app.post('/taophongban', taophongban);

//qlnhanvien
app.get('/qlnhanvien', async (req, res) => {
    if (req.session.user) {

        const data = await getnhanvien(req.session.user.PhongBan, '');
        res.render('qlnhanvien', { user: req.session.user, data });
    } else {
        res.redirect('/');
    }
});

app.post('/search', search);

//QUY TRINH KET NAP DANG
app.get('/quytrinhnv', async (req, res) => {
    if (req.session.user) {
        res.render('quytrinhnv', { user: req.session.user });
    }
    else {
        res.redirect('/')
    }
})
// TẠO QUY TRÌNH NHIỆM VỤ
app.get('/taoqtnv', async (req, res) => {
    if (req.session.user) {
        res.render('taoquytrinhnv', { user: req.session.user });
    }
    else {
        res.redirect('/')
    }
})

//port
const port = 5000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});