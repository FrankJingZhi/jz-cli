#!/usr/bin/env node
const { program } = require('commander')
const chalk = require('chalk')
const inquirer = require('inquirer')
const ora = require('ora')
const figlet = require('figlet')
const path = require('path')
const fsExtra = require('fs-extra')
const gitClone = require('git-clone')

// 模版地址
const projectList = {
  vue: 'git@github.com:FrankJingZhi/vue-template.git',
  'vue&ts': 'git@github.com:FrankJingZhi/vue-template-ts.git',
  react: 'git@github.com:FrankJingZhi/react-template.git',
  'react&ts': 'git@github.com:FrankJingZhi/react-template-ts.git',
}

// 首行提示
program.name('jz-cli').usage('<command> [options]')

// 版本号
program.version(`v${require('../package.json').version}`)

// 命令
// 创建项目
program
  .command('create <app-name>')
  .description('create a new project powered by jz-cli')
  .option('-f, --force', 'overwrite target directory if it exists')
  .action(async (name) => {
    // 文件夹是否存在
    const targetPath = path.join(process.cwd(), name)
    if (fsExtra.existsSync(targetPath)) {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: '文件夹已存在，是否覆盖',
          default: false,
        },
      ])
      if (answer.overwrite) {
        fsExtra.remove(targetPath)
        console.log(chalk.green('删除文件夹成功'))
      } else {
        console.log(chalk.red('创建文件夹失败'))
        return
      }
    }
    // 新建项目
    const projectInfo = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '请选择项目类型',
        choices: [
          {
            name: 'vue',
            value: 'vue',
          },
          {
            name: 'react',
            value: 'react',
          },
        ],
      },
      {
        type: 'list',
        name: 'ts',
        message: '是否需要ts',
        choices: [
          {
            name: '是',
            value: true,
          },
          {
            name: '否',
            value: false,
          },
        ],
      },
    ])
    const projectName = projectInfo.type + (projectInfo.ts ? '&ts' : '')
    const spiner = ora('正在下载模版').start()
    // 下载模版
    gitClone(
      projectList[projectName],
      name,
      {
        check: true,
      },
      (err) => {
        if (err) {
          spiner.fail('项目创建失败')
        } else {
          spiner.succeed('项目创建成功')
          fsExtra.remove(path.join(targetPath, '.git'))
          console.log('Done, now run: \n')
          console.log(chalk.green(`cd ${name}`))
          console.log(chalk.green('npm install'))
          console.log(chalk.green('npm run dev'))
        }
      }
    )
  })

program.on('--help', function () {
  console.log(
    figlet.textSync('JZ-CLI', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    })
  )
})

program.parse(process.argv)
