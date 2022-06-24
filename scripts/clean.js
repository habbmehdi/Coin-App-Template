const {rm} = require('shelljs');

async function main() {
  try {
    rm(
      '-rf',
      './.pm2 ./db ./logs ./statistics.tsv ./archiver-db* ./archiver-logs ./monitor-logs ./db-old-*'.split(
        ' '
      )
    );
  } catch (e) {
    console.error(e);
  }
}
main();
