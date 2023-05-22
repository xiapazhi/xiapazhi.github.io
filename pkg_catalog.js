const fs = require('fs');
const path = require('path');

const currentDir = './'; // 当前文件夹
const sidebarFile = '_sidebar.md'; // 侧边栏文件名
const ignoreDirs = ['.git', '_media',]; // 忽略的文件夹名称
const ignoreFiles = ['README.md','_coverpage.md','_sidebar.md']; // 忽略的文件夹名称

function removeLastMd (str) {
    const lastDotMd = str.lastIndexOf('.md');
    if (lastDotMd !== -1) {
        return str.substr(0, lastDotMd);
    }
    return str;
}
// 遍历目录和文件
function walk (dir) {
    let filelist = '';
    const files = fs.readdirSync(dir);
    files.forEach(function (file) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            // 如果是忽略的文件夹，则跳过
            if (ignoreDirs.includes(file)) {
                return;
            }
            // 如果是文件夹，输出文件夹名
            filelist += `- ${file}\n`;
            filelist += walk(filePath);
        } else if (path.extname(file) === '.md') {
            if (ignoreFiles.includes(file)) {
                return;
            }
            // 如果是 Markdown 文件，输出链接
            const parentDir = path.basename(dir);
            filelist += `  * [${removeLastMd(file)}](${parentDir}/${removeLastMd(file)})\n`;
        }
    });
    return filelist;
}

// 生成 Markdown 代码
const sidebarContent = walk(currentDir);

// 输出到 _sidebar.md 文件
fs.writeFileSync(sidebarFile, sidebarContent);