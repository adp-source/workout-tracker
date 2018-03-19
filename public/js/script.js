document.getElementById('submitBtn').addEventListener('click', function(event){
   event.preventDefault();
   const name = document.getElementById('name').value;
   if(name.length === 0){
      document.getElementById('output').textContent = "Name is required.";
      document.getElementById('output').classList.remove("hidden");
      document.getElementById('name').focus();
      return;
   }
   const reps = document.getElementById('reps').value;
   const weight = document.getElementById('weight').value;
   const date = document.getElementById('date').value;
   const lbs = document.getElementById('lbs').value;
   let req = new XMLHttpRequest();

   req.open('POST', '/insert', true);
   req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
   req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
         console.log("Insert done.");
         document.getElementById('addForm').reset();
         query();
      } else {
         errorMessage(req.statusText);
   }});

   req.send(
      'name=' + name + '&' +
      'reps=' + reps + '&' +
      'weight=' + weight + '&' +
      'date=' + date + '&' +
      'lbs=' + lbs
   );
});

function errorMessage(err){
   document.getElementById('output').textContent = "Error in network request: " + err;
   document.getElementById('output').classList.remove("hidden");
   console.log(err);
}

function query(){
   document.getElementById('output').textContent = "";
   document.getElementById('output').classList.add("hidden");
   let req = new XMLHttpRequest();
   req.open('GET', '/query', true);
   req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
         const response = JSON.parse(req.responseText);
         console.log(response);
         buildTable(response);
         createListeners();
      } else {
         errorMessage();
   }});
   req.send(null);
}

query();
var curAnim = 0;

function buildTable(response){
   const table = document.getElementById('results');
   table.innerHTML = "";
   const properties = ["name", "reps", "weight", "date", "lbs", "id"];
   let row, cell, deleteBtn, editBtn, form, hiddenId, thisDate;
   let delay = 0;
   let alternate = true;
   const animations = ["fadeIn", "flipInX", "fadeInLeft", "fadeInRight"];
   for(i = 0; i<response.length; i++) {
      row = document.createElement("tr");
      for(j = 0; j<3; j++) {
         cell = document.createElement("td");
         cell.textContent = response[i][properties[j]];
         row.appendChild(cell);
      }
      cell = document.createElement("td");
      cell.textContent = response[i][properties[3]].slice(0,10);
      row.appendChild(cell);

      cell = document.createElement("td");
      if(Number(response[i][properties[4]])){
         cell.textContent = "Pound";
      }
      else {
         cell.textContent = "Kilogram";
      }
      row.appendChild(cell);

      cell = document.createElement("td");
      row.appendChild(cell);

      form = document.createElement("form");
      cell.appendChild(form);
      editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("editBtn", "btn", "btn-info");
      editBtn.type = "button";
      form.appendChild(editBtn);
      
      deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("deleteBtn", "btn", "btn-danger");
      deleteBtn.type = "button";
      form.appendChild(deleteBtn);

      hiddenId = document.createElement("input");
      hiddenId.type = "hidden";
      hiddenId.value = response[i].id;
      form.appendChild(hiddenId);

      table.appendChild(row);
      row.classList.add("animated");
      if(curAnim === 0){
         row.classList.add(animations[curAnim]);
      } else if(curAnim === 1) {
         row.classList.add(animations[curAnim]);
      } else if(curAnim === 2) {
         if(alternate)
         {
            row.classList.add(animations[curAnim]);
            alternate = false;
         } else {
            row.classList.add(animations[curAnim+1]);
            alternate = true;
         }
      }
      row.setAttribute("style", "animation-delay: " + delay + "s;");
      delay+=0.15;
   }
   curAnim++ % 3;
}

function deleteItem(button){
   const itemId = button.parentNode.lastChild.value;
   let req = new XMLHttpRequest();
   req.open('POST', '/delete', true);
   req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

   req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
         console.log("Delete done.");
         query();
      } else {
         errorMessage();
   }});

   req.send('id=' + itemId);
}

function editTransform(button){
   button.setAttribute("onclick", "editRequest(this)");
   button.classList.replace("btn-info", "btn-primary");
   button.textContent = "Submit";
   const columns = ["name", "reps", "weight", "date", "lbs"]
   let cells = button.parentNode.parentNode.parentNode.children;
   let text, input;
   for(i = 0; i<3; i++){
      text = cells[i].textContent;
      cells[i].innerHTML = "";
      input = document.createElement("input");
      input.type = "text";
      input.name = "edit-" + columns[i];
      input.id = "edit-" + columns[i];
      input.classList.add("form-control");
      input.value = text;
      cells[i].appendChild(input);
   }
   text = cells[3].textContent;
   cells[3].innerHTML = "";
   input = document.createElement("input");
   input.type = "date";
   input.name = "edit-" + columns[3];
   input.id = "edit-" + columns[3];
   input.classList.add("form-control");
   input.value = text.slice(0,10);
   cells[3].appendChild(input);

   unitText = cells[4].textContent;
   cells[4].innerHTML = "";
   input = document.createElement("select");
   input.name = "edit-" + columns[4];
   input.id = "edit-" + columns[4];
   input.classList.add("form-control");
   let select1 = document.createElement("option");
   select1.value = 1;
   select1.textContent = "Pound";
   input.appendChild(select1);
   let select0 = document.createElement("option");
   select0.value = 0;
   select0.textContent = "Kilogram";
   if(unitText === "Pound"){
      select1.selected = "selected";
   } else {
      select0.selected = "selected";
   }
   input.appendChild(select0);
   cells[4].appendChild(input);
}

function editRequest(button){
   const itemId = button.parentNode.lastChild.value;
   console.log("Edit request" + itemId);

   let req = new XMLHttpRequest();
   const name = document.getElementById('edit-name').value;
   const reps = document.getElementById('edit-reps').value;
   const weight = document.getElementById('edit-weight').value;
   const date = document.getElementById('edit-date').value;
   const lbs = document.getElementById('edit-lbs').value;
   req.open('POST', '/edit', true);
   req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

   req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
         console.log("Edit done.");
         query();
      } else {
         errorMessage();
   }});

   req.send(
      'name=' + name + '&' +
      'reps=' + reps + '&' +
      'weight=' + weight + '&' +
      'date=' + date + '&' +
      'lbs=' + lbs + '&' +
      'id=' + itemId
   );
}

function createListeners(){
   let buttons = document.querySelectorAll("button.deleteBtn");
   for(i=0; i<buttons.length; i++){
      buttons[i].setAttribute("onclick", "deleteItem(this)");
   }
   
   buttons = document.querySelectorAll("button.editBtn");
   for(i=0; i<buttons.length; i++){
      buttons[i].setAttribute("onclick", "editTransform(this)");
   }
}