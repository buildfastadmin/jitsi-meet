// @ts-expect-error
import VideoLayout from '../../../modules/UI/videolayout/VideoLayout';
import { IStore } from '../app/types';
import { getParticipantById } from '../base/participants/functions';
import { getVideoTrackByParticipant } from '../base/tracks/functions.web';

import { SET_SEE_WHAT_IS_BEING_SHARED } from './actionTypes';

export * from './actions.any';

import logger from './logger';


/**
* Captures a screenshot of the video displayed on the large video.
*
* @returns {Function}
*/
export function captureLargeVideoScreenshot() {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const state = getState();
        const largeVideo = state['features/large-video'];
        const promise = Promise.resolve();

        // Default fallback values
        let videoElement: any;
        let maxWidth = 1920;
        let maxHeight = 1080;

        if (largeVideo?.participantId) {
            const participant = getParticipantById(state, largeVideo.participantId);
            const participantTrack = getVideoTrackByParticipant(state, participant);

            if (participantTrack?.jitsiTrack) {
                const videoStream = participantTrack.jitsiTrack.getOriginalStream();

                if (videoStream) {
                    const [ track ] = videoStream.getVideoTracks();
                    const settings = track.getSettings() ?? track.getConstraints();

                    if (settings) {
                        maxWidth = parseInt(settings.width as string, 10) || maxWidth;
                        maxHeight = parseInt(settings.height as string, 10) || maxHeight;
                    }
                }
            }

            // Try to get video element first, fall back to wrapper if no video
            videoElement = document.getElementById('largeVideo');
            if (!videoElement?.videoWidth) {
                videoElement = document.getElementById('largeVideoWrapper');
            }
        } else {
            videoElement = document.getElementById('largeVideoWrapper');
        }

        if (!videoElement) {
            return promise;
        }

        // Calculate dimensions that preserve aspect ratio
        const elementWidth = 'videoWidth' in videoElement && videoElement.videoWidth
            ? videoElement.videoWidth
            : videoElement.clientWidth;
        const elementHeight = 'videoHeight' in videoElement && videoElement.videoHeight
            ? videoElement.videoHeight
            : videoElement.clientHeight;

        const aspectRatio = elementWidth / elementHeight;

        // Calculate target dimensions while preserving aspect ratio
        let width = maxWidth;
        let height = maxHeight;

        if (width / height > aspectRatio) {
            width = Math.floor(height * aspectRatio);
        } else {
            height = Math.floor(width / aspectRatio);
        }

        // Create a HTML canvas and draw video on to the canvas
        const canvasElement = document.createElement('canvas');
        const ctx = canvasElement.getContext('2d');

        canvasElement.style.display = 'none';
        canvasElement.height = height;
        canvasElement.width = width;

        // Calculate positioning to center the video
        const x = (canvasElement.width - width) / 2;
        const y = (canvasElement.height - height) / 2;

        ctx?.drawImage(videoElement, x, y, width, height);
        const dataURL = canvasElement.toDataURL('image/png', 1.0);

        // Cleanup
        ctx?.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasElement.remove();

        return Promise.resolve(dataURL);
    };
}

/**
 * Resizes the large video container based on the dimensions provided.
 *
 * @param {number} width - Width that needs to be applied on the large video container.
 * @param {number} height - Height that needs to be applied on the large video container.
 * @returns {Function}
 */
export function resizeLargeVideo(width: number, height: number) {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const state = getState();
        const largeVideo = state['features/large-video'];

        if (largeVideo) {
            const largeVideoContainer = VideoLayout.getLargeVideo();

            largeVideoContainer.updateContainerSize(width, height);
            largeVideoContainer.resize();
        }
    };
}

/**
 * Updates the value used to display what is being shared.
 *
 * @param {boolean} seeWhatIsBeingShared - The current value.
 * @returns {{
 *     type: SET_SEE_WHAT_IS_BEING_SHARED,
 *     seeWhatIsBeingShared: boolean
 * }}
 */
export function setSeeWhatIsBeingShared(seeWhatIsBeingShared: boolean) {
    return {
        type: SET_SEE_WHAT_IS_BEING_SHARED,
        seeWhatIsBeingShared
    };
}
