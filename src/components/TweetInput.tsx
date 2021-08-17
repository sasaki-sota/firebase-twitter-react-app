import React, { FC, useState, ChangeEvent, FormEvent } from "react";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar, Button, IconButton } from "@material-ui/core";
import { auth, db, storage } from "../firebase";
import firebase from "firebase/app";
import { AddAPhoto } from "@material-ui/icons";

const TweetInput: FC = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState<string>("");

  const onChangeImageHandler = (event: ChangeEvent<HTMLInputElement>) => {
    // 最初の画像データが存在すれば格納する
    // 最後のところにビックリマーク　＝　typescript nullまたはundefindではないことを表す
    if (event.target.files![0]) {
      setTweetImage(event.target.files![0]);
      event.target.value = "";
    }
  };

  //   const sendTweet = (e: FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();
  //     if (tweetImage) {
  //       // 文字の作成
  //       const Str: string =
  //         "abcdefhijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012346789";
  //       // 桁数の作成
  //       const Num: number = 16;
  //       const randomChar = Array.from(
  //         crypto.getRandomValues(new Uint32Array(Num))
  //       )
  //         .map((n) => Str[n % Str.length])
  //         .join("");
  //       const fileName = randomChar + "_" + tweetImage.name;
  //       const uploadTweetImage = storage
  //         .ref(`images/${fileName}`)
  //         .put(tweetImage);
  //       // on = 後処理を記述できる
  //       uploadTweetImage.on(
  //         firebase.storage.TaskEvent.STATE_CHANGED,

  //         () => {},
  //         (err) => alert(err.message),
  //         async () => {
  //           // URLリンクを取得できた場合
  //           await storage
  //             .ref("iamges")
  //             .child(fileName)
  //             .getDownloadURL()
  //             .then(async (url) => {
  //               await db.collection("posts").add({
  //                 avatar: user.photoUrl,
  //                 image: url,
  //                 text: tweetMsg,
  //                 timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  //                 username: user.displayName,
  //               });
  //             });
  //         }
  //       );
  //     } else {
  //       db.collection("posts").add({
  //         avatar: user.photoUrl,
  //         image: "",
  //         text: tweetMsg,
  //         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  //         username: user.displayName,
  //       });
  //     }
  //     setTweetImage(null);
  //     setTweetMsg("");
  //   };

  //   TODO 上のコードだと動かなくてこっちだと動く理由を後で検証する
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tweetImage) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImage);
      uploadTweetImg.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {},
        (err) => {
          alert(err.message);
        },
        async () => {
          await storage
            .ref("images")
            .child(fileName)
            .getDownloadURL()
            .then(async (url) => {
              await db.collection("posts").add({
                avatar: user.photoUrl,
                image: url,
                text: tweetMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName,
              });
            });
        }
      );
    } else {
      db.collection("posts").add({
        avatar: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
    }
    setTweetImage(null);
    setTweetMsg("");
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            type="text"
            className={styles.tweet_input}
            placeholder="今何してる？"
            autoFocus
            value={tweetMsg}
            onChange={(e) => setTweetMsg(e.target.value)}
          />
          <IconButton>
            <label>
              <AddAPhoto
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                type="file"
                className={styles.tweet_hiddenIcon}
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;
