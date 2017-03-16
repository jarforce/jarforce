import React, { Component } from 'react';
import { connect } from 'react-redux';
import NavMaster from './components/NavMaster';
import {
  Body,
  NavMasterContainer,
  StoryMasterContainer,
  DetailViewContainer,
} from './style';
import StoryMaster from './components/StoryMaster';
import DetailView from './components/DetailView';
import LoadingIndicator from '../shared/loading';
import ModalRoot from '../shared/modals/ModalRoot';
import SelectUsernameModal from '../shared/modals/SelectUsernameModal';
import GalleryRoot from '../shared/gallery/GalleryRoot';
import {
  getCurrentFrequency,
  getFrequencyPermission,
} from '../helpers/frequencies';
import { sortArrayByKey } from '../helpers/utils';

class App extends Component {
  state = {
    selectModalOpen: this.props.user.uid &&
      (!this.props.user.username || !this.props.user.email),
  };

  closeSelectModal = () => {
    this.setState({
      selectModalOpen: false,
    });
  };

  render() {
    const { stories, frequencies, user, ui } = this.props;
    const frequency = getCurrentFrequency(
      frequencies.active,
      frequencies.frequencies,
    );
    let sortedStories = sortArrayByKey(
      stories.stories.slice(),
      'timestamp',
    ).reverse();
    if (frequency && !frequency.active !== 'everything') {
      sortedStories = sortedStories.filter(story => {
        return story.frequencyId === frequency.id;
      });
    }
    return (
      <Body>
        <ModalRoot />
        <GalleryRoot />
        <LoadingIndicator />

        <NavMasterContainer viewing={ui.viewing}>
          <NavMaster />
        </NavMasterContainer>

        {/* If the user is logged in, but hasn't selected a username yet prompt them to */
        }
        {!!user.uid &&
          (!user.username || !user.email) &&
          <SelectUsernameModal
            isOpen={this.state.selectModalOpen}
            promptEmail={!user.email}
            onClose={this.closeSelectModal}
          />}

        <StoryMasterContainer active={stories.active} viewing={ui.viewing}>
          <StoryMaster
            loggedIn={!!user.uid}
            role={
              user &&
                frequency &&
                frequency.users[user.uid] &&
                frequency.users[user.uid].permission
            }
            activeFrequency={frequencies.active}
            isPrivate={frequency && frequency.settings.private}
            stories={sortedStories.filter(
              story => story.published && !story.deleted,
            )}
            frequency={frequency}
          />
        </StoryMasterContainer>

        <DetailViewContainer active={stories.active} viewing={ui.viewing}>
          <DetailView />
        </DetailViewContainer>
      </Body>
    );
  }
}

export default connect(state => ({
  stories: state.stories,
  frequencies: state.frequencies,
  user: state.user,
  ui: state.ui,
}))(App);
