import './SwipeSessionPage.css';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../layouts/Header';
import TinderCard from 'react-tinder-card';
import { Rating } from 'react-simple-star-rating';
import ReactModal from 'react-modal';
import io from 'socket.io-client';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export default function SwipeSessionPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [lastDirection, setLastDirection] = useState();
    const currentIndexRef = useRef(-1);
    const lowestIndexSwiped = useRef(-1);
    const [roomId, setRoomId] = useOutletContext();
    const [socket, setSocket] = useState();
    const [matchesIsOpen, setMatchesIsOpen] = useState(false);

    const canSwipe = currentIndex >= 0;
    const canGoBack = currentIndex < restaurants.length - 1;

    useEffect(() => {
        const newSocket = io('http://localhost:3500');

        setSocket(newSocket);

        newSocket.emit("join_room", roomId);

        newSocket.on("restaurants", (restaurants) => {
            setRestaurants(restaurants);

            setCurrentIndex(restaurants.length - 1);
            currentIndexRef.current = restaurants.length - 1;
            lowestIndexSwiped.current = restaurants.length - 1;
        });

        return () => {
            newSocket.disconnect();
        };
    }, [])

    const restaurantRefs = useMemo(
        () => Array(restaurants.length).fill(0).map((i) => React.createRef()), [restaurants]
    )

    const updateCurrentIndex = (val) => {
        setCurrentIndex(val)
        currentIndexRef.current = val;

        if (val + 1 < lowestIndexSwiped.current) {
            lowestIndexSwiped.current = val + 1;
        }
    }

    const outOfFrame = (idx) => {
        currentIndexRef.current >= idx && restaurantRefs[idx].current.restoreCard();
    }

    const swiped = (direction, index) => {
        // ensures swipe only happen once, since for some reason swipe handler can be called 10+ times on a swipe
        // Since currentIndexRef.current will always be updated after the first call with a specific index
        if (index === currentIndexRef.current) {
            
            socket.emit("swipe", index, direction);

            setLastDirection(direction);
            updateCurrentIndex(index - 1);
        }
    }

    const handleSwipe = async (dir) => {
        if (canSwipe && currentIndex < restaurants.length) {
            await restaurantRefs[currentIndex].current.swipe(dir) // Swipe the card!
        }
    }

    const goBack = async () => {
        if (!canGoBack) return;
        const newIndex = currentIndex + 1;
        updateCurrentIndex(newIndex);
        await restaurantRefs[newIndex].current.restoreCard();
    }

    return (
        <div className="swipe-session-body">
            <Header />
            <div className="content-container">
                <div className="card-container">
                    {restaurants.map((restaurant, index) => {
                        return (
                            <TinderCard
                                ref={restaurantRefs[index]}
                                key={index}
                                className='card'
                                preventSwipe={['up', 'down']}
                                outOfFrame={() => outOfFrame(index)}
                                onSwipe={(dir) => swiped(dir, index)}
                                swipeRequirementType={'position'}
                                swipeThreshold={100}
                            >
                                <div
                                    className="card-box"
                                    style={index === currentIndex || index === currentIndex - 1 || index === currentIndex + 1 ? { boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 10px' } : { boxShadow: 'none' }}
                                >
                                    <div className="card-image-container">
                                        <img className="card-image" src={require('../images/RedRobin.jpg')} />
                                    </div>
                                    <div className="card-description-container">
                                        <div className="card-name-container">
                                            <h3 className="card-name">{restaurant.name}</h3>
                                            <div>
                                                <h3 className="card-info-open-closed">Open</h3>
                                            </div>
                                        </div>
                                        <div className="card-info">
                                            <div className="card-info-rating">
                                                <Rating
                                                    initialValue={restaurant.ratingValue}
                                                    readonly={true}
                                                    allowHover={false}
                                                    allowFraction={true}
                                                    fillColor={'#FF9529'}
                                                    size={20}
                                                    onClick={() => { }}
                                                    showTooltip={false}
                                                    disableFillHover={true}
                                                />
                                            </div>
                                            <h3 className="card-info-stars">{restaurant.ratingValue} stars</h3>
                                            <h4 className="card-info-number-ratings">{restaurant.numberRatings} ratings</h4>
                                        </div>
                                    </div>
                                </div>
                            </TinderCard>
                        )
                    }
                    )}
                </div>
                <div className="buttons-container">
                    <div className="single-button-container" style={{ opacity: !canSwipe && '0.5', backgroundColor: !canSwipe && '#242424', cursor: !canSwipe && 'default' }}>
                        <button className="swipe-button" onClick={() => handleSwipe('left')}>
                            <CloseIcon
                                fontSize={'large'}
                                style={{
                                    color: '#f1444c'
                                }}
                            />
                        </button>
                    </div>
                    <div className="single-button-container" style={{ opacity: !canGoBack && '0.5', backgroundColor: !canGoBack && '#242424', cursor: !canGoBack && 'default' }}>
                        <button className="swipe-button" onClick={() => goBack()}>
                            <ReplayIcon
                                fontSize={'large'}
                                style={{
                                    color: 'orange'
                                }}
                            />
                        </button>
                    </div>
                    <div className="single-button-container" style={{ opacity: !canSwipe && '0.5', backgroundColor: !canSwipe && '#242424', cursor: !canSwipe && 'default' }}>
                        <button className="swipe-button" onClick={() => handleSwipe('right')}>
                            <RestaurantIcon
                                fontSize={'large'}
                                style={{
                                    color: '#3BD16F'
                                }} />
                        </button>
                    </div>
                </div>
                <div className="footer-container">
                    <div className="session-pin-text-container">
                        <h3>Session PIN: <b className="session-pin">{roomId}</b></h3>
                    </div>
                    <div className="matches-button-container">
                        <button className="matches-button" onClick={() => setMatchesIsOpen(true)}>View Matches</button>
                    </div>
                </div>
            </div>
            <div className="modal-container">
                <ReactModal
                    isOpen={matchesIsOpen}
                    onRequestClose={() => setMatchesIsOpen(false)}
                    shouldCloseOnOverlayClick={true}
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(8, 8, 8, 0.9)'
                        },
                        content: {
                            border: 'none',
                            backgroundColor: ('#242424'),
                            borderRadius: '30px',
                            width: '50vw',
                            height: 'fit-content',
                            position: "absolute",
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }
                    }}
                >
                    <h2>Matches</h2>
                </ReactModal>

            </div>
        </div>
    )
};