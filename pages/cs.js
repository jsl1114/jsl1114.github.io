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
  const newul = document.createElement('ul')
  getAllFiles('../assets').map(f => {
    const newli = document.createElement('li')
    const newA = document.createElement('a')
    newA.href = `https://jinsenliu.me/${f}`
    newA.id = f

    newli.appendChild(newA)
    newul.appendChild(newli)
  }
  )
  document.getElementById('csin').appendChild(newul)
}

displayAllFiles()