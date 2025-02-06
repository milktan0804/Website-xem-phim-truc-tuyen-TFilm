go
create database QLNHIEMVU
go
use [QLNHIEMVU]
go
set ansi_nulls on
go
set quoted_identifier on

--Quản lý thông tin trong quá trình thực hiện các nhiệm vụ
go
create table TinhTrang(
	IdTT int identity(1,1) primary key,
	LoaiTT nvarchar(50) not null
)

go
create table PhongBan(
	IdPB int identity(1,1) primary key,
	TenPB nvarchar(50) not null,
	IdTruongPhong nvarchar(50),
)

go
create table NhanVien(
	IdNVien varchar(50) not null primary key, --ten dang nhap
	MatKhau varchar(100),
	PhongBan int,
	CONSTRAINT fk_NVien_Id_PB
	foreign key (PhongBan)
	references Phongban (IdPB)
)

go
create table NhiemVu(
	IdNV int identity(1,1) primary key,
	TenNV nvarchar(50) not null,
	NgayBatDauNV date not null,
	NgayKetThucNV date,
	NoiDungNV nvarchar(1000) not null,
	TinhTrangNV int not null, --default 1
	PhongBan int not null,
	CONSTRAINT fk_NV_Id_PB
	foreign key (PhongBan)
	references Phongban (IdPB),
	CONSTRAINT fk_NV_Id_TT
	foreign key (TinhTrangNV)
	references TinhTrang (IdTT)
)

go
create table TaiLieuNV(
	IdTLNV int identity(1,1) primary key,
	IdNV int not null,
	TenTL nvarchar(50),
	Link nvarchar(255),
	CONSTRAINT fk_NV_IdNV_TLNV
	foreign key (IdNV)
	references NhiemVu (IdNV)
)

go
create table PhanCongNhiemVu(
	IdPCNV int identity(1,1) primary key,
	IdNV int not null,
	IdNVien nvarchar(50) not null,
	TinhTrang int default 2,
	constraint fk_PCNV_Id_NV
	foreign key (IdNV)
	references NhiemVu (IdNV),
	constraint fk_PCNV_Id_NVien
	foreign key (IdNVien)
	references NhanVien (IdNVien)
)

go
create table Quyen(
	IdQ int identity(1,1) primary key,
	TenQ nvarchar(50)
)

go
create table PhanQuyen(
	IdPQ int identity(1,1) primary key,
	IdNVien nvarchar(50),
	IdQ int,
	CONSTRAINT fk_PQ_Id_Q
	foreign key (IdQ)
	references Quyen (IdQ),
	CONSTRAINT fk_PQ_Id_NVien
	foreign key (IdNVien)
	references NhanVien (IdNVien)
)

go
create table ChangeLog(
	IdLog int identity(1,1) primary key,
	NoiDung nvarchar(500),
	IdNV int,
	IdPB int,
	IdNVien nvarchar(50),
	NgayTao date,
	CONSTRAINT fk_Log_Id_NV
	foreign key (IdNV)
	references NhiemVu (IdNV),
	CONSTRAINT fk_Log_Id_PB
	foreign key (IdPB)
	references PhongBan (IdPB),
	CONSTRAINT fk_Log_Id_NVien
	foreign key (IdNVien)
	references NhanVien (IdNVien)
)

go
alter table PhongBan
add CONSTRAINT fk_PB_IdTruongPhong_NVien
	foreign key (IdTruongPhong)
	references NhanVien (IdNVien)

go
create function MaHoaMk (@mk nvarchar(50)) returns varchar(32)
as begin
	declare @mh varchar(32) -- mk da ma hoa
	set @mh = CONVERT(varchar(32),HASHBYTES('MD5',@mk), 2)
	return @mh
end


--Quản lý quy trình thực hiện nhiệm vụ
go
create table QuyTrinhNhiemVu(
	IdQTNV int identity(1,1) primary key,
	TenQTNV nvarchar(50) not null

)

go
create table BuocQuyTrinh(
	IdBQT int identity(1,1) primary key,
	IdQTNV int not null,
	NoiDung nvarchar(500) not null,
	CONSTRAINT fk_BQT_Id_QTNV
	foreign key (IdQTNV)
	references QuyTrinhNhiemVu (IdQTNV)
)

go
create table TaiLieu(
	IdTL int identity(1,1) primary key,
	IdBQT int not null,
	tenTL nvarchar(50) not null,
	Link nvarchar(255) not null,
	CONSTRAINT fk_TaiLieu_Id_BQT
	foreign key (IdBQT)
	references BuocQuyTrinh (IdBQT)
)