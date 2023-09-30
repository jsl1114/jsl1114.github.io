const fs = require('fs')

function getAllFiles(dir, allFilesList = []) {
  const files = fs.readdirSync(dir)
  files.map(f => {
    const name = `${dir}/${f}`
    if (fs.statSync(name).isDirectory()) {
      getAllFiles(name, allFilesList)
    }
    else {
      allFilesList.push(name.substring(3))
    }
  })

  return allFilesList
}

// getAllFiles('../assets/cheat-sheet-bundle').map(f => console.log(f))

function displayAllFiles() {
  getAllFiles('../assets').map(f => {
    return (
      <a href={`https://jinsenliu.me/${f}`}>{f}</a>
    )
  })
}