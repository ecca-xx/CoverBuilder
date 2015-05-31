﻿/*     ___  __   __      ___   __  _   _      |  |  | |  | |   |  | |  |  \ /      |  |  | |  | |   |-<  |  |   *      |  |__| |__| |__ |__| |__| _/ \_*/// Product: CoverBuilder// Version: 2.9.6.0// Description: InDesign CS5+ Startup JavaScript// + Create template book covers// + coverbuilder.brunoherfst.com// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER// DEALINGS IN THE SOFTWARE.#target InDesign;#targetengine "CoverBuilder";// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -// STARTUP FUNCTIONS// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -// Quick fix double menu, we need to add this to basic settingstry {    app.menus.item("$ID/Main").submenus.item("CoverBuilder 2.9.2").remove();}catch(e){}try {    app.menus.item("$ID/Main").submenus.item("CoverBuilder 2.9.3").remove();}catch(e){}function getPlatformInfo(){    var platform = File.fs;    if(platform == 'Windows'){        var trailSlash = "\\";    } else if(platform == "Macintosh") {        var trailSlash = "/";    } else {        var trailSlash = undefined;        alert("CoverBuilder\nUnsupported platform: " + platform);    }    return {name : platform, trailSlash : trailSlash};}function getScriptPath(){    try{        myFile = NOT_HERE;    }    catch(myError){        myFile = myError.fileName;    }    return myFile;}function cleanPath(p){    // Remove filename from path    var r = /[^\\\/]*$/;    return p.toString().replace(r, '');}function checkPathObj(pathObj){    for(var prop in pathObj) {        if(!File(pathObj[prop]).exists){            alert("CoverBuilder\nCan't find module "+prop+" at: " + pathObj[prop]);            // ask to locate it?            exit();        }    }}function loadUserSettings(myApp, NewSettings){    var Settings = undefined;    //read settings file    var fSettings = File(myApp.PathTo.settings);    if(fSettings.exists){        fSettings.open('r');        var settings = fSettings.read();        fSettings.close();    } else {        var settings = false;    }    if(settings){        try{            Settings = myApp.JSON.parse(settings);        } catch(e){            alert("CoverBuilder\nCan't read settings at " + myApp.PathTo.settings);            Settings = myApp.JSON.ask2Safe(myApp, "CoverBuilder settings seem corrupt!\nWould you like me to overwrite with new settings?", fSettings, NewSettings);        }    } else {        Settings = myApp.JSON.saveFile(myApp, fSettings, NewSettings);    }    if(Settings.version != NewSettings.version){        alert("CoverBuilder is updating to " + NewSettings.version);        myApp.JSON.saveFile(myApp, fSettings, NewSettings);    }    return Settings;}function getPlugins(folder){    var plugins = new Array;    var files = folder.getFiles();    for (var i = 0; i < files.length; i++) {        var file = files[i];        if (file instanceof File) {            // Ignore hidden files and files without .jsinc extensions            if(file.name.indexOf('.') != 0 || file.name.indexOf('.jsxinc') != -1 ) {                try{                    var thisPlugin = $.evalFile(new File(file));                    if(thisPlugin.hasOwnProperty("plugin_name") && thisPlugin.hasOwnProperty("launch_on_load") ){                        // I consider this a valid plugin now :)                        if((thisPlugin.add_to_menu == undefined) || (thisPlugin.add_to_menu == true)){                            plugins.push(thisPlugin);                        }                    }                } catch(e){                    alert("CoverBuilder Plugin " + file.name + " \n" + e.description);                }            }        }        else if (file instanceof Folder) {            //plugins can use folders for their private files        }        else {            throw new Error("Can't load plugin at \"" + file.fullName);        }    }    return plugins;}// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -// MAIN// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -function main(){    var C = myApp.UI.CoverOrder(myApp);    if(C != null){        myApp.Build.cover(myApp, C);        // plugin Autorun        for ( i=0; i < myApp.plugins.length; i++ ) {            if(myApp.plugins[i].launch_on_load){                myApp.plugins[i].init(myApp);            }        }    }}// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -// INITIALISE// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -var myApp = (function(){    var PlatformInfo = getPlatformInfo();    var pathToScript = cleanPath(getScriptPath());    ///////////////    // P A T H S //    ///////////////    // F O L D E R S    var PathTo = {            app            : pathToScript,            settingsFolder : Folder.userData + PlatformInfo.trailSlash,            libraryFolder  : pathToScript + "INDD_LIB" + PlatformInfo.trailSlash,            helpers        : pathToScript + "Helpers"  + PlatformInfo.trailSlash,            plugins        : pathToScript + "Plugins"  + PlatformInfo.trailSlash,            scriptFolder   : pathToScript + "JSXINC"   + PlatformInfo.trailSlash    }    // F I L E S    PathTo.settings    = PathTo.settingsFolder + "CoverBuilder.settings";    PathTo.preferences = PathTo.settingsFolder + "CoverBuilder.preferences";    /////////////////////    // S E T T I N G S //    /////////////////////    var NewSettings = {        version                        : "2.9.6",            // String        autoload_last_used_settings    : true,               // Boolean        registration_font              : "Helvetica Neue",   // String        standardPPI                    : 300,                // Number        add_drop_shadow                : false, //quicker    // Boolean        add_margin_guides              : false, //cleaner    // Boolean        Platform                       : PlatformInfo,       // Object        mmSlug                         : 5,                  // Number: in millimetre        minPageWidthINDD               : 0.5                 // Number: in millimetre    }    ///////////////////    // M O D U L E S //    ///////////////////    var Module = {            JSON     : PathTo.scriptFolder + "coverbuilder.JSON.jsxinc",            STools   : PathTo.scriptFolder + "coverbuilder.SharedTools.jsxinc",            NumCon   : PathTo.scriptFolder + "coverbuilder.NumberConversion.jsxinc",            // INDESIGN SPECIFIC MODULES //            LibTool  : PathTo.scriptFolder + "indd_coverbuilder.LibTools.jsxinc",            Tools    : PathTo.scriptFolder + "indd_coverbuilder.Tools.jsxinc",            UI       : PathTo.scriptFolder + "indd_coverbuilder.UI.jsxinc",            loadmenu : PathTo.scriptFolder + "indd_coverbuilder.MenuLoader.jsxinc",            XMP      : PathTo.scriptFolder + "indd_coverbuilder.XMP.jsxinc",            Slugs    : PathTo.scriptFolder + "indd_coverbuilder.Slugs.jsxinc",            Build    : PathTo.scriptFolder + "indd_coverbuilder.Build.jsxinc",            // PHOTOSHOP SPECIFIC MODULES //            PSprogress : PathTo.scriptFolder + "ps_Progressor.UI.jsxinc",            PSbuild    : PathTo.scriptFolder + "ps_coverbuilder.Build.jsxinc"    }    checkPathObj(Module);    ///////////////////    // H E L P E R S //    ///////////////////    var Helpers = {            SaveAs         : PathTo.helpers + "CB_SaveAs.jsxinc",            LoadDocPresets : PathTo.helpers + "CB_LoadDocPresets.jsxinc",            PS             : PathTo.helpers + "CB_Send2Photoshop.jsxinc",            Exports        : PathTo.helpers + "CB_Export.jsxinc",            SlugFinisher   : PathTo.helpers + "CB_SlugFinisher.jsxinc",            OpenLib        : PathTo.helpers + "CB_OpenLibUI.jsxinc",            Spine          : PathTo.helpers + "CB_Spine_Corrector.jsxinc",            BreakFrames    : PathTo.helpers + "CB_BreakFrames.jsxinc"    }    // we should not worry if helpers can’t load.    checkPathObj(Helpers);    // Build app from modules    var myApp = new Object();        // Create shortcuts        myApp.PathTo  = PathTo;        myApp.GO      = main;        myApp.Module  = Module;        myApp.Helpers = Helpers;        myApp.Helper  = new Object();        for (var key in Module) {            myApp[key] = $.evalFile(new File(Module[key]));        }        for (var key in Helpers) {            myApp.Helper[key] = $.evalFile(new File(Helpers[key]));        }    ///////////////////    // P L U G I N S //    ///////////////////        myApp.plugins = getPlugins(Folder(myApp.PathTo.plugins));    /////////////////////////////    // U S E R S E T T I N G S //    /////////////////////////////        myApp.Settings = loadUserSettings(myApp, NewSettings);    ////////////////    // BUILD Menu //    ////////////////    var Menu = [        { caption: "New Cover...",              fileName: main, subName: "" },        { separator: true, subName: "" },        { caption: "Save As...",                fileName: myApp.Helper.SaveAs.saveas, subName: "" },        { caption: "Send to Photoshop",         fileName: myApp.Helper.PS.send2photoshop, subName: "" },        { caption: "Export...",       fileName: myApp.Helper.Exports.exportCover, subName: "" },        { separator: true, subName: "" },        { caption: "Correct Spine...",          fileName: myApp.Helper.Spine.changeSpine, subName: "" },        { caption: "Slug Tool...",              fileName: myApp.Helper.SlugFinisher.go, subName: "" },      //{ caption: "Break Frames",              fileName: myApp.Helper.BreakFrames.activeCover, subName: "" },        { separator: true, subName: "" },        { caption: "Load Doc Presets...",       fileName: myApp.Helper.LoadDocPresets.loadsettings, subName: "" }    ];    if(Folder(myApp.PathTo.libraryFolder).getFiles("*.indl").length > 0){        Menu.push({ caption: "Open Library...", fileName: myApp.Helper.OpenLib.loadUI, subName: ""  });    }    Menu.push({ separator: true, subName: "" });    // Add plugins to menu    for ( i=0; i < myApp.plugins.length; i++ ) {        var plugName = myApp.plugins[i].plugin_name;        var plugMenu = myApp.plugins[i].menu_items;        if(plugMenu.length > 0){            Menu.push({                separator: true, subName: plugName            });            for ( menuItem=0; menuItem < plugMenu.length; menuItem++ ) {                if( plugMenu[menuItem].separator ) {                    Menu.push({ separator: true, subName: plugName });                } else {                    Menu.push({                        caption: plugMenu[menuItem].name, fileName: plugMenu[menuItem].f, subName: plugName,                    });                }            }        }    }    // Add report bug request feature    Menu.push({ separator: true, subName: "" },              { caption: "Create Barcode",             fileName: myApp.STools.createBarcode, subName: "" },              { caption: "Help",                       fileName: myApp.STools.getHelp,     subName: "" });    var HelperMenu = $.evalFile(new File(Module.loadmenu));    HelperMenu.loadHelperMenu(myApp, Menu, "CoverBuilder");    return myApp;})();// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -// EOF// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -