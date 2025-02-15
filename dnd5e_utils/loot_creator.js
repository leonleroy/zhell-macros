// Credit to @LukasPrism for the warpgate targeting.

// macro to create loot, either in an item pile or on an actor.
// can additionally add to the sidebar on creation.

// required modules: item-piles, warpgate

// get a random image from the treasurs folder.
const {files} = await FilePicker.browse("public", "icons/commodities/treasure");
const img = files[Math.floor(Math.random() * files.length)];

// set up input fields.
const nameField = `<input id="name" type="text" value="Curiosity">`;
const priceField = `<input id="price" type="number" value="25">`;
const weightField = `<input id="weight" type="number" value="1">`;
const quantityField = `<input id="quantity" type="number" value="1">`;
const descriptionField = `<textarea style="resize: none" id="description" placeholder="Enter text..."></textarea>`;
const sidebarCheck = `<input type="checkbox" id="sidebarbox">`;

// set up html.
const content = `
<p style="text-align:center"><img src="${img}" style="width:60px; height: 60px;"></p>
<hr>
<form>
  <div class="form-group">
    <label for="name">Item name</label>
    <div class="form-fields">${nameField}</div>
  </div>
  <div class="form-group">
    <label for="price">Price (GP)</label>
    <div class="form-fields">${priceField}</div>
  </div>
  <div class="form-group">
    <label for="weight">Weight (lbs.)</label>
    <div class="form-fields">${weightField}</div>
  </div>
  <div class="form-group">
    <label for="quantity">Quantity</label>
    <div class="form-fields">${quantityField}</div>
  </div>
  <div class="form-group">
    <label for="description">Description</label>
    <div class="form-fields">${descriptionField}</div>
  </div>
  <div class="form-group">
    <label for="sidebarbox">Add to sidebar</label>
    <div class="form-fields">${sidebarCheck}</div>
  </div>
</form>`;

// create and render dialog.
new Dialog({
  content,
  title: "Create Loot",
  buttons: {
    go: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Create Loot!",
      callback: async (html) => {
        // construct item data.
        const name = html[0].querySelector("#name").value;
        const value = html[0].querySelector("#description").value;
        const price = Number(html[0].querySelector("#price").value);
        const quantity = Number(html[0].querySelector("#quantity").value);
        const weight = Number(html[0].querySelector("#weight").value);
        const itemData = [{
          name,
          img,
          type: "loot",
          system: {
            description: { value },
            price,
            quantity,
            rarity: "common",
            weight
          }
        }];
        // pick the target or location.
        const crosshairs = await warpgate.crosshairs.show({
          label: "Select recipient or location",
          drawIcon: false,
          size: 1
        });
        const tokenDocs = !crosshairs.cancelled ? warpgate.crosshairs.collect(crosshairs) : [];
        // pop it in the sidebar
        const sidebar = html[0].querySelector("#sidebarbox").checked;
        if (sidebar) await Item.createDocuments(itemData);
        
        // if no token was targeted, add the item to a new item pile, initially hidden.
        if (!tokenDocs.length) {
          const updates = {
            embedded: {
              Item: { [name]: itemData[0] }
            },
            token: { hidden: true }
          }
          return warpgate.spawnAt(crosshairs, "Default Item Pile", updates);
        }
        // if a token was targeted, add to their inventory instead.
        await tokenDocs[0].actor.createEmbeddedDocuments("Item", itemData);
        // if single item pile it's probably named as that item, so fix that
        const isItemPile = tokenDocs[0].getFlag("item-piles", "data.enabled");
        if (!!isItemPile) await tokenDocs[0].update({ name: "Pile of Loot" });
      }
    }
  }
}).render(true);
