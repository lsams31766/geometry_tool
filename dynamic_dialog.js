let resolveModalPromise; // Global variable to store the promise's resolve function
let dialog = null;

// TODO - remember previous values for default select and text input

// forward declare
let MakeDialog = function() {}
let GetControlValues = function() {}

// --------- ASYNC MAJIC STARTS HERE ---------------
closeModal = (result) => {
    result_list = GetControlValues(gridDialog);
    dialog.close();
    if (resolveModalPromise) {
        resolveModalPromise([result, result_list]); // Resolve the stored promise with the result
        resolveModalPromise = null; // Clear the resolve function
    }
}

function openModalAsync(parentDiv,title,dialogObj) {
    // document.getElementById('myModal').style.display = 'block';
    // MakeDialog('#dynamicDialog','Grid Settings',gridDialog);
    MakeDialog(parentDiv,title,dialogObj);
    // Create and return a new Promise
    return new Promise((resolve) => {
        resolveModalPromise = resolve; // Store the resolve function globally
    });
}

/**
 * The main asynchronous function that "waits" for the modal to close.
 */
// call this function to do the dialog - need to clean up interface
async function handleAction() {
    // document.getElementById('status').innerText = 'Status: Opening modal and waiting...';

    // Use await to pause execution until openModalAsync resolves (i.e., modal is closed)
    const [result,result_list] = await openModalAsync('#dynamicDialog','Grid Settings',gridDialog);
    // This code only runs AFTER the modal has been closed
    //console.log("result",result);
    // console.log("result_list",result_list);
    // console.log(typeof(result_list));
    // console.log(result_list.length);
    // make it look nice
    // let txt = '';
    //const prettyJson = JSON.stringify(result_list, null, 2);
    // console.log(prettyJson);
    let txt = '';
    Object.keys(result_list).forEach(key =>{
        txt += key + ':' + result_list[key] + '\n';
    })
    $('#dialogResult').val(txt);
    dialogDone('grid_dialog',result_list);
}
// --------- ASYNC MAJIC ENDS HERE ---------------


$(document).ready( () => {
    // dialog = document.querySelector("dialog");
    
    $('#showDialog').click(function(){
        dialog.showModal();
    });

    // "Close" button closes the dialog
    $( "#closeButton").on( "click", () => {
        // const gridOnOff = $('#gridOnOff').find(":selected").text(); 
        // const gridType = $('#gridType').find(":selected").text(); 
        // const snapOnOff = $('#snapOnOff').find(":selected").text(); 
        // setDialogResult(gridOnOff, gridType, snapOnOff);
        dialog.close();
    });

    // format list of objects
    // each object [text, {object_name:[param1, param2, paramX]}]
    // note: paramX is the selected value (or current value for input box)
    gridDialog = [
        ['Grid',{'gridOnOff':['select','On','Off','Off']}],
        ['Grid Type',{'gridType':['select','Dots','Grid','Dots']}],
        ['Grid Spacing',{'gridSpacing':['input','25']}], // 25 is default value for input box
        ['Snap',{'snapOnOff':['select','On','Off','Off']}]
    ]

    const AppendRow = (targetDiv, rowClass) => {
        var $tDiv = $(targetDiv);
        var rowDivStr = '<div class="' + rowClass + '">';
        var $rowDiv = $(rowDivStr);
        $tDiv.append($rowDiv);
        return [$tDiv, $rowDiv];
    };

    const AppendH4 = (targetDiv, h4Text) => {
        var $tDiv = targetDiv;
        var h4Str = '<h4>' + h4Text + '</h4>';
        var $h4Element = $(h4Str);
        $tDiv.append($h4Element);
        return [$tDiv, $h4Element];
    };

    const AppendCol = (targetDiv, colClass) => {
        var $tDiv = targetDiv;
        var colDivStr = '<div class="' + colClass +'">';
        var $colDiv = $(colDivStr);
        $tDiv.append($colDiv);
        return [$tDiv, $colDiv];
    };
    
    const AppendButton = (targetDiv, aId, aClass, aDisabled, aText) => {
        var $tDiv = targetDiv;
        var btnStr = '<button onclick="closeModal(true)" id="' + aId + '" class="btn ' + aClass + 
            '" ' + aDisabled + '>' + aText + '</button>';
        var $btnElement = $(btnStr);
        $tDiv.append($btnElement);
        return [$tDiv, $btnElement];
    };
    

    const AppendInput = (targetDiv, input_obj) => {
        // add select, input box, other to given div
        objId = Object.keys(input_obj)[0];  // the id of the control
        input_obj_type = input_obj[ObjName][0];  // the type of control
        var $tDiv = targetDiv; // where to append the control to
        if (input_obj_type == 'select') { // select drop down
            var selStr = '<select class=form-control id="' + objId+ '">';
            var $selElement = $(selStr);
            $tDiv.append($selElement);
            // put in the options for the select drop down
            const options = input_obj[ObjName].slice(1);
            // last item is default - pop it off
            selected_option = options.pop();
            options.forEach((o) => {
                var $tDiv = $selElement;
                var optStr = '<option value="' + o + '">' + o + '</option>';
                var $optElelment = $(optStr);
                $tDiv.append($optElelment);
            });
            // set selected value
            $selElement.val(selected_option);
        } 
        if (input_obj_type == 'input') { // input box
            const val = input_obj[ObjName][1];
            var inpStr = '<input class="form-control" id="' + objId + '" value="' + val + '">';
            var $inpElelment = $(inpStr);
            $tDiv.append($inpElelment);            
        } 
    };
    
    MakeDialog = (aParent_div, title, dialogObj) => {
        // [GridOn, GridType, GridSpacing, SnapOn] = MakeDialog(title, input_objects)
        // for each item in list create a row and then components in the row
        let output_list = [];
        parent_div = aParent_div; // set the gloval parent div name
        //var $tDiv = parent_div;
        //$tDiv.empty(); // so refreshes do not accumulate legs
        $(parent_div).empty();
        var [$targetDiv, $cur_row] = AppendRow(parent_div,'row pt-3');
        var [$targetDiv, $col] = AppendCol($cur_row,'col-auto');
        var [$targetDiv, $h4Elem] = AppendH4($col,title);
        for (const row of dialogObj) {
            // row has text, {object_name:[input_type, params]}
            text_msg = row[0];
            input_obj = row[1];
            var [$targetDiv, $cur_row] = AppendRow(parent_div,'row pt-3');
            var [$targetDiv, $col] = AppendCol($cur_row,'col-auto');
            var [$targetDiv, $h4Elem] = AppendH4($col,text_msg);
            // deterimne input object type
            ObjName = Object.keys(input_obj)[0];
            input_obj_type = input_obj[ObjName][0];
            AppendInput($col,input_obj);
          }
          // add a close button - todo save results
          var [$targetDiv, $cur_row] = AppendRow(parent_div,'row pt-3');
          var [$targetDiv, $col] = AppendCol($cur_row,'col-auto');
          var [$targetDiv, $btn] = AppendButton($col, 'closeButton', 'btn-primary', '', 'Close');

          dialog = document.querySelector("dialog");
          dialog.showModal();
    };

    GetControlValues = (dialogObj) => {
        // return user selected values
        var result_list = [];
        for (const row of dialogObj) {
            input_obj = row[1];
            ObjName = String(Object.keys(input_obj)[0]);
            input_obj_type = input_obj[ObjName][0];
            var val = '';
            if (input_obj_type == 'select') {
                val = $('#' + ObjName).find(":selected").text();
            }
            if (input_obj_type == 'input') {
                val = $('#' + ObjName).val();
            }
            result_list[ObjName] = val;
        }
        // also update defaults for the original object
        Object.keys(result_list).forEach(key =>{
            // find the matching key
            for (const row of dialogObj) {
                input_obj = row[1];
                ObjName = String(Object.keys(input_obj)[0]);
                input_obj_type = input_obj[ObjName][0];
                if (ObjName == key) {
                    // change default value - just input for now
                    if (input_obj_type == 'input') {
                        input_obj[ObjName][1] = result_list[key];
                    }
                    if (input_obj_type == 'select') {
                        l = input_obj[ObjName].length;
                        // last value is selected value
                        input_obj[ObjName][l-1] = result_list[key];
                    }
                }
            }
        })
        return result_list;
    };



    // $('#dynDialog').click(function(){
    //     // MakeDialog('#dynamicDialog','Grid Settings',gridDialog);
    //    const result_list = handleAction();
    //    console.log("value",result_list);
    // });

});

/*
  The magic funtion: MakeDialog

  1) Standard dialog title passed in
  2) Pass in list of text descriptions for parameters 
    - these become h4 text inserted before input object
    - pass in list of
       input object type, id, if select then options
    - each param will be in a separate bootstrap row
  3) when done, function deterimens values for each object passed in
    returns as a list

  Example:
    title = 'Grid and Snap Settings'
     format: label text, input object type, input params
    input_objects = [
        {'Grid:',gridOnOff':['select','On','Off']},
        {'Grid Type:','gridType':['select','Dots','Grid']},
        {'Grid Spacing','gridSpacing':['input','25']}, // 25 is default value for input box
        {'Snap','snapOnOff':['select','On','Off']}
    ]
    For step 3, it will read in values for each input object
      (gets text, boolean, selected input)
    and puts in an outpu list [data1, data2, data3 ...] to return to app

    Calling app:
    [GridOn, GridType, GridSpacing, SnapOn] = MakeDialog(title, input_objects)
*/
