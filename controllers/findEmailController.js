const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function runPython(websites) {

    return new Promise((resolve, reject) => {

        const pythonScriptPath = path.join(__dirname, "../python/app.py");

        console.log("Running Python script:", pythonScriptPath);

        const python = spawn("python", [
            pythonScriptPath
        ]);

        let output = "";
        let errorOutput = "";

        python.stdout.on("data", (data) => {
            output += data.toString();
        });

        python.stderr.on("data", (data) => {
            errorOutput += data.toString();
            console.log(data.toString());
        });

        python.on("error", reject);

        python.stdin.write(JSON.stringify({
            websites: websites
        }));

        python.stdin.end();

        python.on("close", (code) => {

            if (code !== 0) {

                return reject(new Error(errorOutput));

            }

            try {

                resolve(JSON.parse(output));

            } catch (err) {

                reject(new Error("Python returned invalid JSON.\n" + output));

            }

        });

    });

}

module.exports = {
  getEmails: async (req, res, next) => {
    try {
      const websites = req.body.domains;

      if (!Array.isArray(websites) || websites.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide websites array.",
        });
      }

      const BATCH_SIZE = 50;

      const batches = [];

      for (let i = 0; i < websites.length; i += BATCH_SIZE) {
        batches.push(websites.slice(i, i + BATCH_SIZE));
      }

      let finalResults = [];

      try {
        for (const batch of batches) {
          console.log(`Processing Batch (${batch.length} websites)...`);

          const batchResult = await runPython(batch);

          if (batchResult.results) {
            finalResults.push(...batchResult.results);
          }
        }

        res.json({
          success: true,
          total: finalResults.length,
          results: finalResults,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
