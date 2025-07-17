PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO d1_migrations VALUES(1,'001_init.sql','2025-04-13 14:49:49');
CREATE TABLE tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  route TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO tools VALUES(1,'QR Generator','Generate QR codes from text','/qr-generator','2025-04-13 14:49:49');
INSERT INTO tools VALUES(2,'URL Shortener','Shorten long URLs','/url-shortener','2025-04-13 14:49:49');
INSERT INTO tools VALUES(3,'QR Generator','Generate QR codes from text','/qr-generator','2025-05-19 14:12:22');
INSERT INTO tools VALUES(4,'URL Shortener','Shorten long URLs','/url-shortener','2025-05-19 14:12:22');
INSERT INTO tools VALUES(5,'QR Generator','Generate QR codes from text','/qr-generator','2025-06-13 04:27:46');
INSERT INTO tools VALUES(6,'URL Shortener','Shorten long URLs','/url-shortener','2025-06-13 04:27:46');
CREATE TABLE article (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  hits INTEGER DEFAULT 0,
  type TEXT,
  chapter INTEGER,
  posted_time TEXT NOT NULL,
  last_mod_time TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  toc_id INTEGER,
  status TEXT,
  fee INTEGER,
  keywords TEXT,
  description TEXT
);
INSERT INTO article VALUES(1,'13231','www',0,NULL,NULL,'2025-06-16T15:21:32.446Z','2025-06-16T15:21:32.446Z',1,NULL,NULL,NULL,NULL,NULL);
INSERT INTO article VALUES(2,'测试内容','测试标题',0,NULL,NULL,'2025-06-16T15:23:26.808Z','2025-06-16T15:23:26.808Z',1,NULL,NULL,NULL,NULL,NULL);
CREATE TABLE article_l (
    id INTEGER NOT NULL,
    lang_code TEXT NOT NULL, -- 存储语言代码，如 'en' for English, 'zh' for Chinese
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,
    description TEXT,
    PRIMARY KEY (id, lang_code), -- 联合主键，确保每篇文章的每种语言都是唯一的
    FOREIGN KEY(id) REFERENCES article(id)
);
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT DEFAULT '佚名',
  email TEXT,
  avatar TEXT DEFAULT 'noavatar.gif',
  psw TEXT,
  type INTEGER,
  create_time TEXT,
  position TEXT,
  signature TEXT,
  ip TEXT,
  last_active_time TEXT,
  is_active INTEGER DEFAULT 0,
  paymentcode TEXT DEFAULT 'nopaymentcode.png',
  active_code TEXT,
  points INTEGER DEFAULT 0,
  is_consult BLOB,
  sid TEXT,
  wechatAccount TEXT,
  aliAccount TEXT,
  amount REAL DEFAULT 0.00
);
INSERT INTO users VALUES(3,'Damon','a121440270@gmail.com','noavatar.gif','123456',NULL,'2025-06-19 04:25:33',NULL,NULL,NULL,'2025-06-19 04:25:33',1,'nopaymentcode.png','f1eb5b8516d8cf2392afe301d4b9129f',0,NULL,NULL,NULL,NULL,0.0);
INSERT INTO users VALUES(4,'Damon','121440270@qq.com','noavatar.gif','123456',NULL,'2025-07-05 12:17:52',NULL,NULL,NULL,'2025-07-05 12:17:52',1,'nopaymentcode.png','43bf12747f30398963b043cba3c478eb',0,NULL,NULL,NULL,NULL,0.0);
CREATE TABLE page_lang (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  lang TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO page_lang VALUES(4,'all','login.submit','Sign In','en','2025-06-18 04:36:04','2025-06-18 12:58:33');
INSERT INTO page_lang VALUES(5,'all','login.psw','Password','en','2025-06-18 04:36:04','2025-06-18 12:36:42');
INSERT INTO page_lang VALUES(6,'all','locale.en','EN','en','2025-06-18 12:45:44','2025-06-18 12:45:44');
INSERT INTO page_lang VALUES(7,'all','locale.zh','CN','en','2025-06-18 12:45:44','2025-06-18 12:45:44');
INSERT INTO page_lang VALUES(8,'all','locale.ja','JP','en','2025-06-18 12:45:45','2025-06-18 12:45:45');
INSERT INTO page_lang VALUES(9,'all','locale.ko','KR','en','2025-06-18 12:45:45','2025-06-18 12:45:45');
INSERT INTO page_lang VALUES(10,'all','locale.ru','RU','en','2025-06-18 12:45:45','2025-06-18 12:45:45');
INSERT INTO page_lang VALUES(11,'all','login.title','User Login','en','2025-06-18 12:45:45','2025-06-18 12:45:45');
INSERT INTO page_lang VALUES(12,'all','login.welcome','Welcome back, please enter your credentials','en','2025-06-18 12:45:45','2025-06-18 12:45:45');
INSERT INTO page_lang VALUES(13,'all','login.email','Email Address','en','2025-06-18 12:45:45','2025-06-18 12:45:45');
INSERT INTO page_lang VALUES(14,'all','login.password','Password','en','2025-06-18 12:45:45','2025-06-18 12:45:45');
INSERT INTO page_lang VALUES(15,'all','locale.en','英語','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(16,'all','locale.zh','中国語','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(17,'all','locale.ja','日本語','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(18,'all','locale.ko','韓国語','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(19,'all','locale.ru','ロシア語','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(20,'all','login.title','ユーザーログイン','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(21,'all','login.welcome','ようこそ、認証情報を入力してください','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(22,'all','login.email','メールアドレス','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(23,'all','login.password','パスワード','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(24,'all','login.submit','ログイン','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(25,'all','login.github','GitHubでログイン','ja','2025-06-18 15:14:25','2025-06-18 15:14:25');
INSERT INTO page_lang VALUES(26,'all','locale.en','영어','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(27,'all','locale.zh','중국어','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(28,'all','locale.ja','일본어','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(29,'all','locale.ko','한국어','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(30,'all','locale.ru','러시아어','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(31,'all','login.title','사용자 로그인','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(32,'all','login.welcome','돌아오신 것을 환영합니다. 자격 증명을 입력해 주세요','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(33,'all','login.email','이메일 주소','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(34,'all','login.password','비밀번호','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(35,'all','login.submit','로그인','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(36,'all','login.github','GitHub로 로그인','ko','2025-06-18 15:15:06','2025-06-18 15:15:06');
INSERT INTO page_lang VALUES(37,'all','locale.en','Английский','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(38,'all','locale.zh','Китайский','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(39,'all','locale.ja','Японский','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(40,'all','locale.ko','Корейский','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(41,'all','locale.ru','Русский','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(42,'all','login.title','Авторизация','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(43,'all','login.welcome','Добро пожаловать, введите свои данные','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(44,'all','login.email','Электронная почта','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(45,'all','login.password','Пароль','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(46,'all','login.submit','Войти','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(47,'all','login.github','Войти через GitHub','ru','2025-06-18 15:15:29','2025-06-18 15:15:29');
INSERT INTO page_lang VALUES(48,'all','locale.en','英文','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(49,'all','locale.ja','日文','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(50,'all','locale.ko','韩文','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(51,'all','locale.ru','俄文','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(52,'all','locale.zh','中文','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(53,'all','login.title','用户登录','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(54,'all','login.welcome','欢迎回来，请输入您的凭证','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(55,'all','login.email','邮箱地址','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(56,'all','login.password','密码','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(57,'all','login.submit','登录','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(58,'all','login.github','使用 GitHub 登录','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(59,'all','auth.register','用户注册','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(60,'all','auth.create_account','创建您的账户','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(61,'all','auth.username','用户名','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(62,'all','auth.confirm_password','确认密码','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(63,'all','auth.register_btn','立即注册','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(64,'all','auth.no_account','没有账号？','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(65,'all','auth.register_now','立即注册','zh','2025-06-18 15:16:09','2025-06-18 15:16:09');
INSERT INTO page_lang VALUES(66,'all','auth.no_account','No account? ','en','2025-06-18 15:28:31','2025-07-16 04:37:09');
INSERT INTO page_lang VALUES(67,'all','auth.register_now','Sign up','en','2025-06-18 15:31:16','2025-07-16 04:37:28');
INSERT INTO page_lang VALUES(68,'all','auth.email','邮箱','en','2025-06-18 15:31:58','2025-06-18 15:31:58');
INSERT INTO page_lang VALUES(69,'all','auth.username','User Name','en','2025-06-18 15:34:24','2025-07-16 14:28:35');
INSERT INTO page_lang VALUES(70,'all','auth.password','密码','en','2025-06-18 15:34:24','2025-06-18 15:34:24');
INSERT INTO page_lang VALUES(71,'all','auth.confirm_password','Confirm Password','en','2025-06-18 15:34:24','2025-07-16 14:29:10');
INSERT INTO page_lang VALUES(72,'all','auth.register_btn','Submit','en','2025-06-18 15:34:24','2025-07-16 14:36:54');
INSERT INTO page_lang VALUES(73,'all','auth.have_account','Already have an account?','en','2025-06-18 15:34:24','2025-07-16 14:49:26');
INSERT INTO page_lang VALUES(74,'all','auth.login_here','Log in!','en','2025-06-18 15:34:24','2025-07-16 14:50:30');
INSERT INTO page_lang VALUES(75,'all','auth.register','User registration','en','2025-06-18 15:35:35','2025-07-16 14:27:15');
INSERT INTO page_lang VALUES(76,'all','auth.create_account','创建账号','en','2025-06-18 15:35:35','2025-06-18 15:35:35');
INSERT INTO page_lang VALUES(77,'all','password_mismatch','确认码和密码不一致','en','2025-06-18 15:46:42','2025-06-18 15:46:42');
INSERT INTO page_lang VALUES(78,'all','auth.login_success','登录成功','en','2025-06-23 04:23:28','2025-06-23 04:23:28');
INSERT INTO page_lang VALUES(79,'all','blog.title','文章标题','zh','2025-07-13 09:51:45','2025-07-13 09:51:45');
INSERT INTO page_lang VALUES(80,'all','menu.desc','Handy tools and atricles for developers','en','2025-07-14 15:17:33','2025-07-14 15:17:33');
INSERT INTO page_lang VALUES(81,'all','menu.desc','面向开发者的实用工具与文章','zh','2025-07-14 15:17:33','2025-07-14 15:17:33');
INSERT INTO page_lang VALUES(82,'all','login.out','Logout','en','2025-07-14 15:22:22','2025-07-14 15:22:22');
INSERT INTO page_lang VALUES(83,'all','login.out','退出','zh','2025-07-14 15:22:23','2025-07-14 15:22:23');
INSERT INTO page_lang VALUES(84,'all','home.title','首页','zh','2025-07-15 00:02:55','2025-07-15 00:02:55');
INSERT INTO page_lang VALUES(85,'all','home.title','HOME','en','2025-07-15 00:02:55','2025-07-15 00:02:55');
INSERT INTO page_lang VALUES(86,'all','menu.ttf','TTF抽取/压缩','zh','2025-07-15 04:29:59','2025-07-15 04:29:59');
INSERT INTO page_lang VALUES(87,'all','menu.ttf','TTF Extract/Compress','en','2025-07-15 04:29:59','2025-07-15 04:33:15');
INSERT INTO page_lang VALUES(88,'all','blog.name','博客','zh','2025-07-15 11:30:13','2025-07-15 11:30:13');
INSERT INTO page_lang VALUES(89,'all','blog.name','blog','en','2025-07-15 11:30:13','2025-07-15 11:30:13');
INSERT INTO page_lang VALUES(90,'all','menu.filetype','文件处理','zh','2025-07-15 15:11:48','2025-07-15 15:11:48');
INSERT INTO page_lang VALUES(91,'all','menu.filetype','File processing','en','2025-07-15 15:11:48','2025-07-15 15:11:48');
INSERT INTO page_lang VALUES(92,'all','menu.crypto','加密处理','zh','2025-07-15 15:14:57','2025-07-15 15:14:57');
INSERT INTO page_lang VALUES(93,'all','menu.crypto','Crypto','en','2025-07-15 15:14:57','2025-07-15 15:14:57');
INSERT INTO page_lang VALUES(94,'all','menu.token','Token generator','en','2025-07-15 15:18:17','2025-07-15 15:18:17');
INSERT INTO page_lang VALUES(95,'all','menu.token','Token生成','zh','2025-07-15 15:18:17','2025-07-15 15:18:17');
INSERT INTO page_lang VALUES(96,'all','menu.hash','哈希生成','zh','2025-07-15 15:18:17','2025-07-15 15:18:17');
INSERT INTO page_lang VALUES(97,'all','menu.hash','Hash text','en','2025-07-15 15:18:18','2025-07-15 15:18:18');
INSERT INTO page_lang VALUES(98,'all','search.placeholder','Search','en','2025-07-16 04:14:25','2025-07-16 04:14:25');
INSERT INTO page_lang VALUES(99,'all','search.placeholder','搜索','zh','2025-07-16 04:14:25','2025-07-16 04:14:25');
INSERT INTO page_lang VALUES(100,'all','ttf.desc','根据输入或上传字符，提取并压缩TTF字体，仅保留所需字形，极大减小字体体积（输出ttf、woff）。','zh','2025-07-16 04:18:36','2025-07-16 04:23:01');
INSERT INTO page_lang VALUES(101,'all','ttf.desc','Input characters or Upload text, extract needed glyphs from TTF, output smaller TTF & WOFF.','en','2025-07-16 04:18:36','2025-07-16 04:24:58');
INSERT INTO page_lang VALUES(102,'all','auth.have_account','已有账号？','zh','2025-07-16 14:49:46','2025-07-16 14:49:46');
INSERT INTO page_lang VALUES(103,'all','auth.login_here','去登录','zh','2025-07-16 14:51:19','2025-07-16 14:51:19');
INSERT INTO page_lang VALUES(104,'all','font.title','TTF字体抽取压缩工具','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(105,'all','font.desc','通过输入需要的字符或上传包含字符的文本，提取并压缩TTF字体文件，仅保留所需字形，极大减小字体体积。','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(106,'all','font.upload','上传TTF字体','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(107,'all','font.selected','已选择: {name}','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(108,'all','font.origin_size','原始大小: {size}','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(109,'all','font.input_chars','输入字符','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(110,'all','font.input_placeholder','请输入需要保留的字符','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(111,'all','font.char_count','去重后共 {count} 个','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(112,'all','font.upload_text','或上传文本','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(113,'all','font.text_selected','已选择: {name}','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(114,'all','font.output_type','输出格式','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(115,'all','font.start','开始压缩','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(116,'all','font.clear','全部清空','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(117,'all','font.success','压缩完成','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(118,'all','font.download','点击下载压缩后的字体文件','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(119,'all','font.only_glyphs','(仅包含所需字形)','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(120,'all','font.compressed_size','压缩后: {size}','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(121,'all','font.error','字体压缩失败: {msg}','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(122,'all','font.preview_generating','字体预览生成中...','zh','2025-07-17 05:26:51','2025-07-17 05:26:51');
INSERT INTO page_lang VALUES(123,'all','font.title','TTF Font Extraction & Compression Tool','en','2025-07-17 05:27:16','2025-07-17 05:27:16');
INSERT INTO page_lang VALUES(124,'all','font.desc','Extract and compress TTF font files by entering required characters or uploading text, keeping only needed glyphs to greatly reduce font size.','en','2025-07-17 05:27:16','2025-07-17 05:27:16');
INSERT INTO page_lang VALUES(125,'all','font.upload','Upload TTF Font','en','2025-07-17 05:27:16','2025-07-17 05:27:16');
INSERT INTO page_lang VALUES(126,'all','font.selected','Selected: {name}','en','2025-07-17 05:27:16','2025-07-17 05:27:16');
INSERT INTO page_lang VALUES(127,'all','font.origin_size','Original size: {size}','en','2025-07-17 05:27:16','2025-07-17 05:27:16');
INSERT INTO page_lang VALUES(128,'all','font.input_chars','Input Characters','en','2025-07-17 05:27:16','2025-07-17 05:27:16');
INSERT INTO page_lang VALUES(129,'all','font.input_placeholder','Enter characters to keep','en','2025-07-17 05:27:16','2025-07-17 05:27:16');
INSERT INTO page_lang VALUES(130,'all','font.char_count','Deduplicated: {count}','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(131,'all','font.upload_text','Or upload text','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(132,'all','font.text_selected','Selected: {name}','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(133,'all','font.output_type','Output Format','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(134,'all','font.start','Start Compression','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(135,'all','font.clear','Clear All','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(136,'all','font.success','Compression Complete','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(137,'all','font.download','Click to download compressed font file','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(138,'all','font.only_glyphs','(Only contains required glyphs)','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(139,'all','font.compressed_size','Compressed: {size}','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(140,'all','font.error','Font compression failed: {msg}','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
INSERT INTO page_lang VALUES(141,'all','font.preview_generating','Generating font preview...','en','2025-07-17 05:27:17','2025-07-17 05:27:17');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('tools',6);
INSERT INTO sqlite_sequence VALUES('d1_migrations',1);
INSERT INTO sqlite_sequence VALUES('article',2);
INSERT INTO sqlite_sequence VALUES('page_lang',141);
INSERT INTO sqlite_sequence VALUES('users',4);
CREATE UNIQUE INDEX idx_unique_lang_entry ON page_lang(route, key, lang);
CREATE TRIGGER trg_page_lang_updated_at
AFTER UPDATE ON page_lang
FOR EACH ROW
BEGIN
  UPDATE page_lang SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
COMMIT;
