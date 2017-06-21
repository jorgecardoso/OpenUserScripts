// ==UserScript==
// @name         Pautas UC Smart Paste
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Allows pasting "Pautas" directly on the Pautas page of the InforDocente system of the University of Coimbra. Just copy (Ctrl-C) a table from a spreadsheet file making sure that there is a column with the student number and a column with the grade. Then click on any input in the pauta webpage and Ctrl-V.
// @author       jorgecardoso
// @match        https://infordocente.uc.pt/nonio/pautas/gerePauta.do*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("Pautas UC Smart Paste");
    document.querySelector("table.displaytable input").addEventListener("paste", function(evt){
        console.log("paste");
        console.log(evt.clipboardData);
        console.log(evt.clipboardData.getData("text/plain"));

        var data = evt.clipboardData.getData("text/plain");
        var rawTable = data.split("\n");
        var dataTable = [];
        rawTable.forEach(function(row) {
            console.log(row);
            var r = row.split("\t").map(function(s) {return s.trim();});
            console.log(r);
            dataTable.push(r);

        });
        console.log(dataTable);


        function getStudentScore(studentNumber) {

            for (var i = 0; i < dataTable.length; i++) {
                var row = dataTable[i];
                for (var j = 0; j < row.length; j++) {
                    var d = row[j];
                    if(d.trim() === studentNumber.trim() ) {
                        console.log("Found student", studentNumber, " grade: ", row[row.length-1]);
                        return row[row.length-1];
                    }
                }
            }
            return undefined;
        }

        $("table.displaytable tr").each(function() {
            //console.log(this);
            var $studentNumber = $(this).find("td:nth-child(2)");
            //console.log($studentNumber.text());

            if ($studentNumber.length > 0 ) {
                var $score =  $(this).find("input");
                console.log($score);
                var studentScore = getStudentScore($studentNumber.text());
                if (studentScore) {
                    $score.val(studentScore);
                }

                $score.trigger("change");

            }
        });
        evt.preventDefault();
    });

})();