const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const { chromium } = require("playwright");

// 1. Load partials
const bulletTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/bullet.html"),
  "utf8"
);
Handlebars.registerPartial("bullet", bulletTemplate);

// 2. Load JSON datasets
const dataEn = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/data.json"), "utf8")
);
const dataPt = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/data_pt.json"), "utf8")
);

const dataDe = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/data_de.json"), "utf8")
);

// 3. Convert photo path to Base64
const photoPath = path.resolve(dataEn.person.photo);
const photoBase64 = fs.readFileSync(photoPath).toString("base64");
const photoDataUrl = `data:image/jpeg;base64,${photoBase64}`;

// 4. Load HTML template and CSS
const htmlTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/document.html"),
  "utf8"
);
const htmlTemplatePt = fs.readFileSync(
  path.join(__dirname, "../templates/document_pt.html"),
  "utf8"
);

const htmlTemplateDe = fs.readFileSync(
  path.join(__dirname, "../templates/document_de.html"),
  "utf8"
);

const css = fs.readFileSync(
  path.join(__dirname, "../styles/document.css"),
  "utf8"
);

// 5. Helper function to construct full HTML document
const compileHtml = (dataset) => {
  const template = Handlebars.compile(htmlTemplate);
  const bodyContent = template({
    ...dataset,
    person: {
      ...dataset.person,
      photo: photoDataUrl
    }
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
};

const compileHtmlPt = (dataset) => {
  const template = Handlebars.compile(htmlTemplatePt);
  const bodyContent = template({
    ...dataset,
    person: {
      ...dataset.person,
      photo: photoDataUrl
    }
  });
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
};

const compileHtmlDe = (dataset) => {
  const template = Handlebars.compile(htmlTemplateDe);
  const bodyContent = template({
    ...dataset,
    person: {
      ...dataset.person,
      photo: photoDataUrl
    }
  });
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
};

// 6. Build HTML strings
const htmlEn = compileHtml(dataEn);
const htmlPt = compileHtmlPt(dataPt);
const htmlDe = compileHtmlDe(dataDe);

// 7. PDF Generation Workflow
(async () => {
  const documents = [
    { html: htmlEn, fileName: "CV_en.pdf" },
    { html: htmlPt, fileName: "CV_pt.pdf" },
    { html: htmlDe, fileName: "CV_de.pdf" }
  ];

  const outputDir = "/home/work/Code/portfolio-v2/public/files";

  // Create the directory if it doesn't exist
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const doc of documents) {
    await page.setContent(doc.html, {
      waitUntil: "networkidle"
    });

    const outputPath = path.join(outputDir, doc.fileName);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true
    });

    console.log(`PDF created: ${outputPath}`);
  }

  await browser.close();
})();