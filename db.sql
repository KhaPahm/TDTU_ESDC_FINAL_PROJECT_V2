create database ESDC_final;
use ESDC_final;

create table Product (
	ProductID int not null AUTO_INCREMENT,
    Name nvarchar(60) not null,
    Description mediumtext,
    Type nvarchar(40) not null,
    Price int not null,
    primary key (ProductID)
);
alter table Product auto_increment = 1000;
alter table Product add Deleted boolean DEFAULT false

create table Images(
	ImagesID int(8) not null auto_increment,
    Path char(200) not null,
    ProductID int not null,
    primary key (ImagesID),
    foreign key (ProductID) references Product(ProductID)
);
alter table Images auto_increment = 2000;
alter table Images add Deleted boolean default false

create table Property(
	PropertyID int(8) not null auto_increment,
    Color nvarchar(30) not null,
    Colorpicker char(7) not null,
    Size char(1) not null,
    Amount int not null,
    ProductID int not null,
    primary key (PropertyID),
    foreign key (ProductID) references Product(ProductID)
);
alter table Property auto_increment = 3000;
alter table Property add Deleted boolean default false


create table UserAccount(
	UserName char(30) not null,
    Password char(30) not null,
    primary key (UserName)
);
alter table UserAccount add Verify datetime 
alter table UserAccount add Role boolean default false

create table Avatar(
	AvatarID int auto_increment not null,
    src char(250) not null,
    UserName char(30),
    primary key (AvatarID),
    foreign key (Username) references UserAccount(Username)
);
alter table Avatar auto_increment = 8000;

create table Staff(
	StaffID int auto_increment not null,
    FirstName nvarchar(30) not null,
    LastName nvarchar(39) not null,
    Sex nvarchar(3),
    Phone char(10) not null,
    Address text,
    Username char(30),
    Primary key (StaffID),
    foreign key (Username) references UserAccount(Username)
);
alter table Staff auto_increment = 4000;
alter table Staff add Role int
alter table Staff add Deleted boolean default false
alter table Staff add IDCartNumber int(12)
alter table Staff add Email char(50)
alter table Staff modify column DateOfBirth char(10)
alter table Staff modify column IDCartNumber char(12)



create table User(
	UserID int auto_increment not null,
    FirstName nvarchar(30) not null,
    LastName nvarchar(39) not null,
    Sex nvarchar(3),
    Phone char(10) not null,
    Email text,
    Username char(30),
    Primary key (UserID),
    foreign key (Username) references UserAccount(Username)
);
alter table User auto_increment = 5000;

create table UserAddress(
	AddressID int auto_increment not null,
    Address text not null,
    UserID int,
    primary key (AddressID),
    foreign key (UserID) references User(UserID)
);
alter table UserAddress auto_increment = 5000;
alter table UserAddress add Province nvarchar(40) not null
alter table UserAddress add District nvarchar(40) not null
alter table UserAddress add Ward nvarchar(40) not null
alter table UserAddress add Deleted boolean DEFAULT false;


create table Receipt (
	ReceiptID int auto_increment not null,
    State nvarchar(30)  not null,
	AddressID int not null,
    Total double not null,
    Date datetime not null DEFAULT CURRENT_TIMESTAMP,
    Pay boolean not null,
    StaffNote text,
    CustomerNote text,
    StaffID int,
    UserID int not null,
    primary key (ReceiptID),
	foreign key (AddressID) references UserAddress(AddressID),
    foreign key (UserID) references User(UserID),
    foreign key (StaffID) references Staff(StaffID)
);
alter table Receipt auto_increment = 6000;
ALTER TABLE Receipt ALTER State SET DEFAULT 'waiting';
ALTER TABLE Receipt ALTER Pay SET DEFAULT false;
 
create table ReceiptDetail (
	ReceiptID int,
    ProductID int,
    Amount int, 
    PurchasePrice double,
    Size char(5),
    Color nvarchar(30),
    foreign key (ReceiptID) references Receipt(ReceiptID),
    foreign key (ProductID) references Product(ProductID)
);

drop table Receipt
drop table ReceiptDetail


create table Cart(
	CartID int auto_increment not null,
    Total double not null default 0,
    UserID int,
    primary key (CartID),
    foreign key (UserID) references User(UserID)
);
alter table Cart auto_increment = 11000;

create table CartDetail(
	CartID int not null,
    ProductID int not null,
    Amount int, 
    PurchasePrice double,
    Size char(2),
    Color nvarchar(30),
    foreign key (CartID) references Cart(CartID),
	foreign key (ProductID) references Product(ProductID)
);

drop table CartDetail
drop table Cart


alter table 
drop table Receipt
alter table esdc_final.useraccount modify column password char(250);



