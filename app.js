//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-abdullah:todolist-DB@cluster0.tezbeaa.mongodb.net/todoListDB"
);

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome To WattBit's Todo-List",
});
const item2 = new Item({
  name: "Click + to add a task",
});
const item3 = new Item({
  name: "<-- click here to delete a task!",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", async function (req, res) {
  const day = date.getDate();

  let foundItems = await Item.find({});

  if (foundItems.length === 0) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: day, newListItems: foundItems });
  }
});

app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === date.getDate()) {
    item.save();
    res.redirect("/");
  } else {
    let foundList = await List.findOne({ name: listName });
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if (listName === date.getDate()) {
    await Item.findByIdAndDelete(checkedItemId);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    );
    res.redirect("/" + listName);
  }
});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  let searchResult = await List.findOne({ name: customListName });

  if (!searchResult) {
    const list = new List({
      name: customListName,
      items: defaultItems,
    });

    list.save();
    res.redirect(`/${customListName}`);
  } else {
    res.render("list", {
      listTitle: customListName,
      newListItems: searchResult.items,
    });
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, function () {
  console.log("Server has started SuccessFully!");
});
