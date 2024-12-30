<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<html>
<head>
    <title>${recipe.title}</title>
</head>
<body>
    <h2>${recipe.title}</h2>
    <p>${recipe.description}</p>
    <h3>Ingredients</h3>
    <ul>
        <c:forEach var="ingredient" items="${recipe.ingredients}">
            <li>${ingredient}</li>
        </c:forEach>
    </ul>
</body>
</html>
