// ==UserScript==
// @name         Assignments UC Paste Comments
// @namespace    https://jorgecardoso.eu
// @version      0.2
// @license MIT
// @description  Allows pasting Comments directly on the Assignments page of the InforDocente system of the University of Coimbra. Just copy (Ctrl-C) a table from a spreadsheet file making sure that there is a column with the student number and a column with the comments (the comments column should be the last column). Then open the assignment page and press Ctrl-V; a button will appear: click on it and wait for all comments to be inserted.
// @author       jorgecardoso
// @copyright    2020, Jorge C. S. Cardoso (https://jorgecardoso.eu)
// @match        https://infordocente.uc.pt/nonio/ensino/detalhesSubmissaoTrabalhos.do*
// @match        https://infordocente.uc.pt/nonio/ensino/detalhesSubmissaoAluno.do*
// @match        https://infordocente.uc.pt/nonio/ensino/adicionarAlterarApreciacao.do*
// @grant        none
// @updateURL https://openuserjs.org/meta/jorgecardoso/Assignments_UC_Paste_Comments.meta.js
// ==/UserScript==

(function() {
    'use strict';

    let OPEN_NEW_TAB = false;

    if ( window.location.href.indexOf("detalhesSubmissaoTrabalhos.do") >= 0) {
        console.log("Entregas Trabalhos UC");

        document.querySelector("body").addEventListener("paste", function(evt){
            var data = evt.clipboardData.getData("text/plain");
            console.log("Pasted data: ");

            var newData = "";
            var insideQuote = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i] === "\"" ) {
                    insideQuote = !insideQuote;
                    console.log("quote");
                }
                if (data[i] === "\n" && insideQuote) {
                    newData += "####";
                } else {
                    newData += data[i];
                }
            }
            //console.log(data);
            console.log(newData);
            var rawTable = newData.split("\n");
            var dataTable = [];
            rawTable.forEach(function(row) {
                var r = row.split("\t").map(function(s) {return s.trim();});
                dataTable.push(r);
            });
            console.log(dataTable);
            localStorage.setItem("dataTable", JSON.stringify(dataTable));
            var automateButton = document.createElement('button');
            automateButton.innerText = "Go";
            automateButton.style.cssText = "position: fixed; right:0; top:50%";
            document.body.appendChild(automateButton);

             console.log("Automating");
                var linksToProcess = [];

                // get all links for student numbers present in our data table
                var rows = document.querySelectorAll("table td:nth-last-child(6),table td:nth-last-child(7)");

                rows.forEach(function(row){
                    let number = row.innerText.trim();
                    if (number.length == 10 ) {

                        if (existsInTable(dataTable, row.innerText.trim())) {

                            console.log("Exists");

                            linksToProcess.push(row.parentElement.querySelector("[href^=\"detalhesSubmissaoAluno.do\"]"));
                        }
                    }
                });
                console.log(linksToProcess);

            automateButton.addEventListener("click", function() {
               
                //  var allLinks = document.querySelectorAll("[href^=\"detalhesSubmissaoAluno.do\"]");
                var currentLink = 0;

                window.addEventListener("message", function(event) {
                    if (!event.data.aupc) return;
                    //console.log("received", event);
                    if (event.data.ok) {
                        console.log("Processed student: ", event.data.studentNumber);
                        setTimeout(function() {
                            processNextStudent();
                        }, 100);

                    } else {
                         console.log("Error processing student: ", event.data.error);
                    }
                 }, false);


                //console.log(allLinks);
                let processNextStudent = function() {
                    currentLink++;
                    console.log("Current Link", currentLink);
                    if (currentLink < linksToProcess.length) {
                        if (OPEN_NEW_TAB) {
                            window.open(linksToProcess[currentLink].href+"&automate=true");
                            console.log("Opened new tab with URL", linksToProcess[currentLink].href+"&automate=true");
                        } else {
                            win.location= linksToProcess[currentLink].href+"&automate=true";
                            console.log("Opened URL", linksToProcess[currentLink].href+"&automate=true");
                        }
                        //setTimeout( returnCloseWindow(window), 5000);
                    }
                };


                var win = window.open(linksToProcess[currentLink].href+"&automate=true");

            });
        });

    } else if ( window.location.href.indexOf("detalhesSubmissaoAluno.do") >= 0 && window.location.href.indexOf("automate=true") >= 0) {
        console.log("Entregas Trabalhos UC Aluno");

        var adicionar = document.querySelector("[href^=\"adicionarAlterarApreciacao.do\"]");
        if (adicionar !== null) {
            window.location = adicionar.href+"&automate=true";
        }

    } else if ( window.location.href.indexOf("adicionarAlterarApreciacao.do") >= 0 && window.location.href.indexOf("automate=true") >= 0 ) {
        let error = null;

        window.onload = function() {
            setTimeout(function() {
                console.log("Entregas Trabalhos UC Aluno: Apreciacao");
                var dataTable = JSON.parse(localStorage.getItem("dataTable"));
                //console.log(dataTable);
                if (dataTable) {
                    var editor = document.querySelector("#htmlhelper_ifr");
                    //console.log(editor);

                    // setTimeout(function() {
                    var autores = document.querySelector("#adicionarAlterarApreciacaoFormBean table tr:nth-child(3) td:nth-child(2)");
                    var studentNumbers = Array.from(new Set(autores.innerText.match(/\d\d\d\d\d\d\d\d\d\d/gi)));
                    console.log("Processing students", studentNumbers);
                    var first = true;
                    var innerDoc = editor.contentDocument || editor.contentWindow.document;
                    var textField = innerDoc.getElementById("tinymce");
                    for (var i = 0; i < studentNumbers.length; i++ ) {
                        console.log(studentNumbers[i]);
                        for ( var j = 0; j < dataTable.length; j++) {
                            for ( var k = 0; k < dataTable[j].length; k++) {
                                //console.log(dataTable[j][k]);
                                if (studentNumbers[i] === dataTable[j][k] ) {
                                    console.log("Found comments for student ", studentNumbers[i], ": ", dataTable[j][dataTable[j].length-1]);
                                    if (first) {
                                        textField.innerText = "";
                                        first = false;
                                    }
                                    console.log(dataTable[j][dataTable[j].length-1]);

                                    textField.innerText += dataTable[j][dataTable[j].length-1].replace(/####/g, '\n').replace(/"/g, '');

                                }
                            }
                        }
                    }
                    if (first) {
                        console.warn("Did not find comments for students");
                        error = "No data for students " + studentNumbers.join();
                    } else {
                        let visible = document.querySelector("input[name=\"visivelAlunos\"]");
                        visible.checked = true;
                        console.log("Setting visible to students");

                        var gravar = document.querySelector("input[type=\"submit\"][value=\"Gravar\"]");

                        setTimeout(function(){
                            gravar.click();
                        }, 100);
                        console.log("Saving...");

                    }
                    setTimeout(function() {
                        if (error != null ) {
                            window.opener.postMessage({aupc: true, ok: false, error: error}, "*");
                        } else {
                            window.opener.postMessage({aupc: true, ok: true, studentNumber: studentNumbers.join()}, "*");
                        }

                    }, 100);

                } else {
                    error = "No data table!";
                }
            }, 1000);



        };

    }

    function existsInTable(dataTable, value) {
        for ( var j = 0; j < dataTable.length; j++) {
            for ( var k = 0; k < dataTable[j].length; k++) {
                //console.log(dataTable[j][k]);
                if (value === dataTable[j][k] ) {
                    return true;
                }
            }
        }
        return false;
    }

    function indexInTable(dataTable, value) {
        for ( var j = 0; j < dataTable.length; j++) {
            for ( var k = 0; k < dataTable[j].length; k++) {
                //console.log(dataTable[j][k]);
                if (value === dataTable[j][k] ) {
                    return j;
                }
            }
        }
        return -1;
    }
})();