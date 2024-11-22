
import { Text, TouchableOpacity } from "react-native"
import { styles } from "./ButtonAdd.style"

export function ButtonAdd({ onPress }){
    return (
        <TouchableOpacity style={styles.btn} onPress={onPress}>
            <Text style={styles.txt} >+ New todo</Text>
        </TouchableOpacity>
    )
}