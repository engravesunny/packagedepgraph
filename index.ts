import {isPortOpen, run_server, depAnalyze} from "./server";
import { getLocalDepConfObj, DepConfObj } from "./utils";
import fs from "fs";
import path from "path";
import { consoleStyle } from "./consolestyle";

// 命令行解析执行


let depth:number = -1;
let jsonPath:string = "";
let pkg = "";
let ver = "";
let helpFlag = false;
// 帮助提示信息 待填写
const helpInfo = 
`\nUsage: pkg-cli [arguments] [options] 

Description:
  pkg-cli can display dependency information of the package and run a server to graphical display

Options:
  -h, --help     Display help information
  -p, --package  Specify the package name of analyze with the version
  -v, --version  Specify the version of analyze with the package name
  -d, --depth    Specify the depth of traversal 
  -j, --json     Specify the saved path of dependency information

Arguments:
  help           show help information without any options
  analyze        analyze a package's dependencies with the version information

Examples:
  pkg-cli help || pkg-cli || pkg-cli analyze -h       Display help information
  pkg-cli runserver                                   Run a server to graphically display dependency information of the current project
  pkg-cli analyze                                     Display dependency information of the current package with a server
  pkg-cli analyze -p=test -v=1.0.0                    Display dependency information of the package test@1.0.0
  pkg-cli analyze -d=4                                Display The first four levels dependency information of the current package with a server
  pkg-cli analyze -j=./data/save.json                 Save dependency information of the current package with a server
  \n`;

try{
    if(process.argv.slice(2).length === 0){
        console.log(helpInfo)
    }else if(process.argv[2] === "runserver"){
        // 判断端口是否被占用，没有被占用则打开服务器，被占用则不执行
        isPortOpen().then((isOpen:boolean)=>{
            if(isOpen){
                run_server();
            }
        }).catch((err:Error)=>{
            console.error(err);
        })
    }
    else if(process.argv[2] === "help"){
        console.log(helpInfo);
    }else if(process.argv[2] === "analyze"){
        const argv = process.argv.slice(3);
        argv.forEach((item, index)=>{
            if(item.startsWith("--depth=") || item.startsWith("-d=")){
                depth = parseInt(item.split("=")[1]);
            }else if(item.startsWith("--json=") || item.startsWith("-j=")){
                jsonPath = item.split("=")[1];
            }else if(item.startsWith("--package=") || item.startsWith("-p=")){
                pkg = item.split("=")[1];
            }else if(item.startsWith("--version=") || item.startsWith("-v=")){
                ver = item.split("=")[1];
            }else if(item.startsWith("--help" || item.startsWith("-h"))){
                helpFlag = true;
            }
        })
        
        if(helpFlag){
            console.log(helpInfo);
        }else{
            if(depth <= 0){
                depth = Infinity;
            }
            if(pkg === "" && ver === ""){
                if(fs.existsSync(path.join(process.cwd(), "package.json"))){
                    let {name, version} = require(path.join(process.cwd(), "package.json"));
                    pkg = name;
                    ver =version;
                    // 判断端口是否被占用，没有被占用则打开服务器，被占用则不执行
                    isPortOpen().then((isOpen:boolean)=>{
                        if(isOpen){
                            run_server();
                        }
                    }).catch((err:Error)=>{
                        console.error(err);
                    })
                }else{
                    throw new Error("Error:请在nodejs项目根路径下执行[analyze-cli]命令")
                }
            }else if(pkg !== "" && ver !==""){
            
            }else{
                throw new Error("Error:命令格式--package选项和--version选项必须一起出现或者一起不出现");
            }
            
            let depConfObj:DepConfObj = getLocalDepConfObj(pkg, ver);
            // console.log(depth)
            depAnalyze.load(depConfObj.name, depConfObj.version, depth);
            
            console.log(depAnalyze.toSimpleObject());
            
            if(jsonPath!==""){
                if(jsonPath.endsWith(".json")){
                    depAnalyze.save(jsonPath);
                }
            }
        }
    }else{
        throw new Error(`Error:命令格式不规范\n${helpInfo}`);
    }
}catch(e){
    console.error((e as any).message);
}


