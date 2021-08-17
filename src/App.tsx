import React, {useEffect, FC} from "react";
import "./App.module.css";
import {useSelector, useDispatch} from "react-redux";
import {selectUser, login, logout} from "./features/userSlice";
import {auth} from "./firebase";
import Feed from "./components/Feed";
import Auth from "./components/Auth";
import styles from "./App.module.css";

const App: FC = () => {
    // ステートを取得する
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    useEffect(() => {
        // firebaseのユーザーに対して何らかの変化があった場合に呼び出される
        const unSub = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                dispatch(
                    login({
                        uid: authUser.uid,
                        photoUrl: authUser.photoURL,
                        displayName: authUser.displayName,
                    })
                );
            } else {
                dispatch(logout());
            }
        });
        return () => {
            unSub();
        };
    }, [dispatch]);

    return (
        <>
            {/* ログインしているかしていないかでの判定処理 */}
            {user.uid ? (
                <div className={styles.app}>
                    <Feed/>
                </div>
            ) : (
                <Auth/>
            )}
        </>
    );
};

export default App;
