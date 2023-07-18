import './MatchModal.css';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Rating } from 'react-simple-star-rating';
import ReactModal from 'react-modal';

export default function MatchModal({ isOpen, setIsOpen, restaurantMatch }) {
    const handleGoogleRedirect = (url) => {
        window.open(url, "_blank");
    }
    
    return (
        <div>
            <ReactModal
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(false)}
                className="match-modal"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(8, 8, 8, 0.9)',
                        overFlowY: 'auto'
                    },
                    content: {
                        border: 'none',
                        backgroundColor: ('#242424'),
                        borderRadius: '15px',
                        height: 'fit-content',
                        position: "absolute",
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        overflowX: 'hidden'
                    }
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <h1 className="match-header">It's a Match!</h1>
                    <h3 className="match-description">Everyone in this room liked:</h3>
                    <h2>{restaurantMatch.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <h4 className="match-info-number-ratings" style={{ paddingTop: '0px' }}>{restaurantMatch.ratingValue}</h4>
                        <div className="card-info-rating" style={{ margin: '10px' }}>
                            <Rating
                                initialValue={restaurantMatch.ratingValue}
                                readonly={true}
                                allowHover={false}
                                allowFraction={true}
                                fillColor={'#FF9529'}
                                size={18}
                                onClick={() => { }}
                                showTooltip={false}
                                disableFillHover={true}
                            />
                        </div>
                        <h4 className="match-info-number-ratings">({restaurantMatch.numberRatings})</h4>
                    </div>
                    <div className="match-image-container">
                        <img className="match-image" src={require('../../../images/RedRobin.jpg')} />
                    </div>
                    <div>
                        <button className="view-website-button" onClick={() => handleGoogleRedirect(restaurantMatch.url)}>
                            <h3 className="view-website-text">
                                View on Google
                            </h3>
                            <ArrowOutwardIcon 
                                fontSize={'medium'}
                            />
                        </button>
                    </div>
                </div>
            </ReactModal>
        </div>
    )
}