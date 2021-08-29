const mocha = require("mocha");
const fs = require("fs");
const path = require("path");

const createFolderStructure = (fullPath) => {
  const paths = fullPath.split(path.normalize(path.sep));

  let currentPath = "";

  paths.forEach((part) => {
    currentPath = path.join(currentPath, part);

    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });
};

const removeParent = (tree) => {
  // eslint-disable-next-line no-param-reassign
  delete tree.parent;

  if (tree.children) {
    tree.children.forEach((node) => {
      removeParent(node);
    });
  }
};

const saveFile = (fullPath, fileName, json) => {
  fs.writeFileSync(path.join(fullPath, fileName), JSON.stringify(json));
};

function JsonReporter(runner) {
  mocha.reporters.Base.call(this, runner);

  const jsonResult = {
    info: {},
    tests: [],
  };

  let current;

  runner.on("suite", (suite) => {
    if (suite.root) {
      jsonResult.info.summary = "New Release Execution";
      jsonResult.info.description = "This execution triggered by release mr";
      current = jsonResult;
    }
  });

  runner.on("pass", (test) => {
    const node = {
      testKey: `${test.title}`.match(/\[(.+)\]/)[1],
      start: `${new Date().toISOString()}`,
      finish: `${new Date().toISOString()}`,
      comment: "No Comments",
      status: "PASSED",
    };

    current.tests.push(node);
  });

  runner.on("fail", (test, err) => {
    const node = {
      testKey: `${test.title}`.match(/\[(.+)\]/)[1],
      start: `${new Date().toISOString()}`,
      finish: `${new Date().toISOString()}`,
      comment: "No Comments",
      status: "FAILED",
    };

    current.tests.push(node);
  });

  runner.on("end", () => {
    removeParent(jsonResult);

    const reportPath = process.env.MOCHAJSONREPORT_PATH
      ? process.env.MOCHAJSONREPORT_PATH
      : "./cypress/results/xray/";
    const fileName = process.env.MOCHAJSONREPORT_FILENAME
      ? process.env.MOCHAJSONREPORT_FILENAME
      : "e2eResults.json";

    createFolderStructure(reportPath);
    saveFile(reportPath, fileName, jsonResult);
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath);
    }

    const fullFileName = path.join(reportPath, fileName);

    fs.writeFileSync(fullFileName, JSON.stringify(jsonResult));
  });
}

module.exports = JsonReporter;
