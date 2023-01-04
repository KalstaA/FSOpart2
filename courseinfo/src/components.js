const Header = ({ name }) => {
    return (
      <div>
        <h2>{name}</h2>
      </div>
    )
  }
  
  const Part = ({ part }) => {
    return (
      <p>
        {part.name} {part.exercises}
      </p>
    )
  }
  
  const Content = ({ parts }) => {
    return (
      <div>
        {parts.map(part =>
          <Part key={part.id} part={part} />
         )}
      </div>
    )
  }
  
  const Total = ({ course }) => {
    // Calculate total amount of exercises in the course
    return (
      <div>
        <h4>total of {course.parts.reduce(
          (s, p) => s + p.exercises, 0
        )} exercises
        </h4>
      </div>
    )
  }
  
  const Course = ({ course }) => {
    return (
      <div>
        <Header name={course.name} />
        <Content parts={course.parts} />
        <Total course={course} />
      </div>
    )
  }

  export default Course