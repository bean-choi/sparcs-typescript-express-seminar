import express from "express";
import feedStore from "../modules/feedStore";

const router = express.Router();

router.get("/getFeed", (req, res) => {
  try {
    const requestCount = parseInt(req.query.count as string, 10);
    const storeRes = feedStore.selectItems(requestCount);
    if (storeRes.success) {
      res.json(storeRes.data.map(({ id, ...item}) => ({
        ...item,
        id: id.toString(),
      })));
    } else {
      res.status(400).json(storeRes.data);
    }
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post("/addFeed", (req, res) => {
  try {
    const { title, content } = req.body;
    const storeRes = feedStore.insertItem({ title, content });
    if (storeRes) {
      res.json({ isOK: true });
    } else {
      res.status(500).json({ isOK: false });
    }
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post("/deleteFeed", (req, res) => {
  try {
    const { id } = req.body;
    const storeRes = feedStore.deleteItem(parseInt(id as string, 10));
    if (storeRes) {
      res.json({ isOK: true });
    } else {
      res.status(500).json({ isOK: false });
    }
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post("/editFeed", (req, res) => {
  try {
    const { id, newTitle, newContent } = req.body;
    
    const storeRes = feedStore.updateItem(parseInt(id as string, 10), newTitle, newContent );

    if (storeRes) {
      res.json({ isOK: true });
    } else {
      res.status(404).json({ isOK: false });
    }
  } catch (e) {
    res.status(500).json({ error: e });
  }
});


export default router;
