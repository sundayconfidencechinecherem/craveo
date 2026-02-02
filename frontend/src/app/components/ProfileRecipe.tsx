import React from "react";

// Define types that match your GraphQL schema
interface RecipeDetails {
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
}

interface RecipePost {
  id: string;
  title: string;
  content: string;
  postType: string;
  images: string[];
  recipeDetails?: RecipeDetails;
}

interface ProfileRecipeProps {
  recipes: RecipePost[];
}

const ProfileRecipe: React.FC<ProfileRecipeProps> = ({ recipes }) => {
  if (!recipes || recipes.length === 0) {
    return <p>No recipes yet.</p>;
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">My Recipes</h2>
      {recipes.map((recipe: RecipePost) => (
        <div key={recipe.id} className="border p-4 mb-4 rounded">
          <h3 className="font-semibold">{recipe.title}</h3>
          {recipe.recipeDetails && (
            <div>
              <h4 className="mt-2 font-medium">Ingredients:</h4>
              <ul className="list-disc list-inside">
                {recipe.recipeDetails.ingredients.map((ing: string, i: number) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>

              <h4 className="mt-2 font-medium">Instructions:</h4>
              <ol className="list-decimal list-inside">
                {recipe.recipeDetails.instructions.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              {recipe.recipeDetails.prepTime && (
                <p>Prep Time: {recipe.recipeDetails.prepTime} mins</p>
              )}
              {recipe.recipeDetails.cookTime && (
                <p>Cook Time: {recipe.recipeDetails.cookTime} mins</p>
              )}
              {recipe.recipeDetails.servings && (
                <p>Servings: {recipe.recipeDetails.servings}</p>
              )}
              {recipe.recipeDetails.difficulty && (
                <p>Difficulty: {recipe.recipeDetails.difficulty}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default ProfileRecipe;
