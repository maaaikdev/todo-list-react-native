import { Image, Text } from "react-native"
import { styles } from "./Header.style";
import ImgLogo from "../../assets/logo.png";

export function Header(){
    return (
        <>
            <Image style={styles.img} source={ImgLogo} resizeMode="contain"/>
            <Text style={styles.subtitle}>You probably have something</Text>
        </>
    )
}