import { message } from 'antd';
import autobind from 'autobind-decorator';
import { is, Map } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import handleError from 'control/utils/handleError';
import LoadingOverlay from 'control/components/common/LoadingOverlay';
import RecipeForm from 'control/components/recipes/RecipeForm';
import QueryRecipe from 'control/components/data/QueryRecipe';

import { addSessionView } from 'control/state/app/session/actions';

import { updateRecipe } from 'control/state/app/recipes/actions';
import { getRecipe } from 'control/state/app/recipes/selectors';
import { getRecipeForRevision } from 'control/state/app/revisions/selectors';
import { getUrlParamAsInt } from 'control/state/router/selectors';


@connect(
  state => {
    const recipeId = getUrlParamAsInt(state, 'recipeId');
    const recipe = getRecipe(state, recipeId, new Map());

    return {
      recipeId,
      recipe: getRecipeForRevision(state, recipe.getIn(['latest_revision', 'id']), new Map()),
    };
  },
  {
    addSessionView,
    updateRecipe,
  },
)
@autobind
export default class EditRecipePage extends React.PureComponent {
  static propTypes = {
    addSessionView: PropTypes.func.isRequired,
    updateRecipe: PropTypes.func.isRequired,
    recipeId: PropTypes.number.isRequired,
    recipe: PropTypes.instanceOf(Map),
  };

  static defaultProps = {
    recipe: null,
  };

  state = {
    formErrors: undefined,
  };

  componentDidMount() {
    const recipeName = this.props.recipe.get('name');
    if (recipeName) {
      this.props.addSessionView('recipe', recipeName, this.props.recipe.get('identicon_seed'));
    }
  }

  componentWillReceiveProps({ recipe }) {
    const oldRecipe = this.props.recipe;

    // New recipe means we add a session view.
    if (!is(oldRecipe, recipe)) {
      const recipeName = recipe.get('name');
      this.props.addSessionView('recipe', recipeName, recipe.get('identicon_seed'));
    }
  }

  /**
   * Update the existing recipe and display a message.
   */
  async handleSubmit(values) {
    const { recipeId } = this.props;

    this.setState({
      formErrors: undefined,
    });

    try {
      await this.props.updateRecipe(recipeId, values);
      message.success('Recipe updated!');
    } catch (error) {
      handleError('Recipe cannot be updated.', error);

      this.setState({
        formErrors: error.data || error,
      });
    }
  }

  render() {
    const { recipe, recipeId } = this.props;

    return (
      <div className="edit-page">
        <QueryRecipe pk={recipeId} />
        <LoadingOverlay requestIds={`fetch-recipe-${recipeId}`}>
          <h2>Edit Recipe</h2>

          <RecipeForm
            recipe={recipe}
            onSubmit={this.handleSubmit}
            errors={this.state.formErrors}
          />
        </LoadingOverlay>
      </div>
    );
  }
}
