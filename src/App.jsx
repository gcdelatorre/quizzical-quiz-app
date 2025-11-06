import { useState, useEffect, useRef} from "react"
import { nanoid } from "nanoid"


export default function App () {
  const [categories, setCategories] = useState([])
  const [questions, setQuestions] = useState([])
  const [gameStarting, setGameStarting] = useState(false)

    useEffect(() => {
      // fetch("https://opentdb.com/api.php?amount=5")
      //   .then(res => res.json())
      //   .then(data => setQuestions(data.results))
      //   .catch(err => console.error(err))
      console.log("fetch questions disabled for now")
    }, [])

    // console.log(questions)

    useEffect(() => {
      fetch("https://opentdb.com/api_category.php")
        .then(res => res.json())
        .then(data => setCategories(data.trivia_categories))
        .catch(err => console.error(err))
    }, [])

    console.log(categories)

    const categoryElements = categories.map(cat => {
      return (
        <option key={nanoid()} value={cat.id}>{cat.name}</option>
      )
    })



  return (
    <>
      <h1>Quizzical</h1>
      <p>Answer the questions and test your knowledge!</p>
      
      <form action="">
          <div className="select-category">
            <label htmlFor="category"> Category:
              <select name="category" id="category" defaultValue="Any Category">
                <option value="Any Category">Any Category</option>
                {categoryElements}
              </select>
            </label>
          </div>

          <div className="select-difficulty">
            <label htmlFor="difficulty"> Difficulty:
              <select name="difficulty" id="difficulty">
                <option value="Any Difficulty">Any Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>

          <div className="select-type">
            <label htmlFor="type"> Type of questions:
              <select name="type" id="type">
                <option value="Any Type">Any Type</option>
                <option value="multiple">Multiple Choice</option>
                <option value="boolean">True or Flase</option>
              </select>
            </label>
          </div>
      </form>
    </>
  )
}