const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssSorter = require("css-declaration-sorter");
// const mmq = require("gulp-merge-media-queries");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify");
const fs = require("fs");
const path = require("path");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const { src, dest } = require("gulp");
const data = require("gulp-data");

// function browserInit(done) {
//   browserSync.init({
//     proxy: "http://localhost:8888/sayaka_OpenCafe/", // ここにあなたのローカルサイトのURLを設定
//   });
//   done();
// }

function browserInit(done) {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });
  done();
}

function compileSass() {
  return (
    gulp
      .src("./src/sass/style.scss")
      .pipe(
        plumber({
          errorHandler: function (error) {
            console.error(error.message); // 変更: error.messageFormatted から error.message へ
            this.emit("end"); // 追加: エラー後もタスクを続行するため
          },
        })
      )
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss([autoprefixer(), cssSorter()]))
      // .pipe(mmq())
      .pipe(gulp.dest("./dist/assets/css/"))
      .pipe(browserSync.stream())
  );
}

function browserReload(done) {
  browserSync.reload();
  done();
}

function watch() {
  gulp.watch("./src/sass/**/*.scss", compileSass);
  gulp.watch(
    "./src/json/**/*.json",
    gulp.series(compileEjs, compileWorks, browserReload)
  );
  gulp.watch(
    "./src/ejs/**/*.ejs",
    gulp.series(compileEjs, compileWorks, browserReload)
  );
  gulp.watch("./src/js/**/*.js", gulp.series(minJs, browserReload));
  gulp.watch("./src/img/**/*", copyImage);
}

function copyImage() {
  return (
    gulp
      .src("./src/img/**/*", { encoding: false }) //encording:falseは画像ファイルのUTF-8エンコーディングを回避するためのもの
      //
      .pipe(gulp.dest("./dist/assets/img/"))
  );
}

function minJs() {
  return gulp
    .src("./src/js/**/*.js")
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./dist/assets/js"));
}

// function compileEjs() {
//   return gulp
//     .src(["./src/ejs/**/*.ejs", "!./src/ejs/partials/**"])
//     .pipe(ejs({}, {}, { ext: ".html" }))
//     .pipe(rename({ extname: ".html" }))
//     .pipe(gulp.dest("./dist"));
// }

// function compileEjs() {
//   return gulp
//     .src(["./src/ejs/**/*.ejs", "!./src/ejs/partials/**"])
//     .pipe(
//       data(function (file) {
//         const jsonPath = path.resolve(
//           "./src/json",
//           path.basename(file.path, ".ejs") + ".json"
//         );

//         let jsonData = {};
//         if (fs.existsSync(jsonPath)) {
//           jsonData = JSON.parse(fs.readFileSync(jsonPath));
//         }

//         return jsonData;
//       })
//     )
//     .pipe(ejs({}, {}, { ext: ".html" }))
//     .pipe(rename({ extname: ".html" }))
//     .pipe(gulp.dest("./dist"));
// }

function compileEjs() {
  const files = fs
    .readdirSync("src/ejs")
    .filter((file) => file.endsWith(".ejs") && file !== "works.ejs");

  return Promise.all(
    files.map((file) => {
      const jsonPath = path.join("src/json", file.replace(".ejs", ".json"));
      const jsonData = fs.existsSync(jsonPath)
        ? JSON.parse(fs.readFileSync(jsonPath))
        : {};

      const siteData = JSON.parse(fs.readFileSync("src/json/site.json"));

      return src(`src/ejs/${file}`)
        .pipe(ejs({ ...siteData, ...jsonData })) // ← 結合してEJSに渡す
        .pipe(rename({ extname: ".html" }))
        .pipe(dest("dist"));
    })
  );
}

function compileWorks(done) {
  const worksData = JSON.parse(fs.readFileSync("src/json/works.json", "utf8"));
  const siteData = JSON.parse(fs.readFileSync("src/json/site.json", "utf8"));
  const categories = [...new Set(worksData.cards.map((card) => card.category))];

  categories.forEach((category) => {
    const filteredCards = worksData.cards.filter(
      (card) => card.category === category
    );
    gulp
      .src("./src/ejs/works.ejs")
      .pipe(
        ejs({
          ...siteData,
          category: category,
          cards: filteredCards,
        })
      )
      .pipe(rename(`works-${category}.html`))
      .pipe(dest("dist"));
  });
  done();
}

exports.default = gulp.series(compileEjs, compileSass, browserInit, watch);
