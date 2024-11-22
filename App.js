import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { styles } from './App.style';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './components/Header/Header';
import { CardTodo } from './components/CardTodo/CardTodo';
import { useEffect, useRef, useState } from 'react';
import { TabBottomMenu } from './components/TabBottomMenu/TabBottomMenu';
import { ButtonAdd } from './components/ButtonAdd/ButtonAdd';
import Dialog from "react-native-dialog";
import uuid from "react-native-uuid";
import AsyncStorage from '@react-native-async-storage/async-storage';

let isFirstRender = true;
let isLoadUpdate = false;

export default function App() {

	const [ todoList, setTodoList ] = useState([
		// { id: 1, title: "Walk the dog", isCompleted: true },
		// { id: 2, title: "Go to the dentist", isCompleted: false },
		// { id: 3, title: "Learn React Native", isCompleted: false },
		// { id: 4, title: "Walk the dog", isCompleted: true },
		// { id: 5, title: "Go to the dentist", isCompleted: false },
		// { id: 6, title: "Learn React Native", isCompleted: false },
	]);

	const [ selectedTabName, setSelectedTabName ] = useState("all");
	const [ isAddDialogDisplayed, setIsAddDialogDisplayed ] = useState(false);
	const [ inputValue, setInputValue ] = useState("");
	const scrollViewRef = useRef();

	useEffect(() => {
		loadTodoList();
	}, [])
	
	useEffect(() => {
		if(!isLoadUpdate){
			if(!isFirstRender){
				saveTodoList();
			} else {
				isFirstRender = false;
			}
		} else {
			isLoadUpdate = false;
		}
	}, [todoList])

	async function loadTodoList(){
		console.log("LOAD");
		try {
			const todoListString = await AsyncStorage.getItem("@todoList");
			const parsedTodoList = JSON.parse(todoListString);
			isLoadUpdate = true;
			setTodoList(parsedTodoList || []);
		} catch(err){
			alert(err)
		}
	}

	async function saveTodoList(){
		console.log("SAVE");
		try {
			await AsyncStorage.setItem("@todoList", JSON.stringify(todoList))
		} catch(err){
			alert(err)
		}
	}

	//Filter tasks of the list
	function getFilteredList(){
		switch(selectedTabName) {
			case "all":
				return todoList
			case "inProgress":
				return todoList.filter((todo) => !todo.isCompleted);
			case "done":
				return todoList.filter((todo) => todo.isCompleted);
		}
	}

	function deleteTodo(todoTodDelete){
		Alert.alert(
			"Delete todo", 
			"Are you sure you want to delete this todo ?",
			[
				{text: "Delete", style: "destructive", onPress: () => {
					setTodoList(todoList.filter((t) => t.id !== todoTodDelete.id));
				}},
				{text: "Cancel", style: "cancel"}
			]
		)

	}

	//Render and use the getFilteredList when the user click bottom menu
	function renderTodoList(){
		return getFilteredList().map((item) => (
			<View key={item.id} style={styles.cardItem}>
				<CardTodo todo={item} onPress={updateTodo} onLongPress={deleteTodo}/>
			</View>
		))
	}

	function updateTodo(todo){
		//update only state opposite the current value
		const updatedTodo = {
			...todo,
			isCompleted: !todo.isCompleted
		};
		//Duplicate array
		const updateTodoList = [...todoList];
		//find and match index to Update
		const indexToUpdate = updateTodoList.findIndex((t) => t.id === updatedTodo.id);
		//Insert Object updated (I need to understand better)
		updateTodoList[indexToUpdate] = updatedTodo;
		//Update UseState
		setTodoList(updateTodoList);
	}

	function addTodo(){
		const newTodo = {
			id: uuid.v4(),
			title: inputValue,
			isCompleted: false
		};
		setTodoList([...todoList, newTodo]);
		setIsAddDialogDisplayed(false);
		setInputValue("");
		setTimeout(() => {
			scrollViewRef.current.scrollToEnd();
		}, 300);
	}

	function renderAddDialog(){
		return (
			<Dialog.Container 
				visible={isAddDialogDisplayed}
				onBackdropPress={() => setIsAddDialogDisplayed(false)}
			>
				<Dialog.Title>Add todo</Dialog.Title>
				<Dialog.Description>Choose name for you todo</Dialog.Description>
				<Dialog.Input
					onChangeText={setInputValue}
					placeholder="Ex: Go to the dentist" 
				/>
				<Dialog.Button 
					label="Cancel" 
					color="grey" 
					onPress={() => setIsAddDialogDisplayed(false)}
				/>
				<Dialog.Button
					disabled={inputValue.length === 0}
					label="Save"
					onPress={addTodo}
				/>
			</Dialog.Container>
		)
	}

	return (
		<>
			<SafeAreaProvider>
				<SafeAreaView style={styles.app}>
					<View style={styles.header}>
						<Header />
					</View>
					<View style={styles.body}>
						<ScrollView ref={scrollViewRef}>
							{renderTodoList()}
						</ScrollView>
					</View>
					<ButtonAdd onPress={() => setIsAddDialogDisplayed(true)}/>
				</SafeAreaView>
			</SafeAreaProvider>
			<View style={styles.footer}>
				<TabBottomMenu 
					todoList={todoList}
					selectedTabName={selectedTabName}
					onPress={setSelectedTabName}
				/>
			</View>
			{renderAddDialog()}
		</>
	);
}
