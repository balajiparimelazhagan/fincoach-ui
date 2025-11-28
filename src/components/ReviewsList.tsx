import React from 'react';
import ReviewCard from './ReviewCard';
import { giftOutline, personOutline } from 'ionicons/icons';

interface ReviewItem {
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  icon?: any;
}

const sampleData: ReviewItem[] = [
  { id: '1', title: 'John@ybl', subtitle: '18th of every month', amount: 120, icon: giftOutline },
  { id: '2', title: 'Balaji@nal', subtitle: 'Quarterly', amount: 233, icon: personOutline },
  { id: '3', title: 'John.s', subtitle: 'Annual', amount: -265, icon: giftOutline },
];

const ReviewList: React.FC = () => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = React.useState(0);

  React.useEffect(() => {
    if (cardRef.current) {
      setCardHeight(cardRef.current.offsetHeight);
    }
  }, []);

  const stackOffset = 8;
  const containerHeight = cardHeight + (sampleData.length - 1) * stackOffset;

  return (
    <div>
      <div className="px-1 mt-5 flex justify-between">
        <span className="text pb-3 font-semibold text-gray-800">Add to budget ?</span>
        <span className=" text-xs text-primary cursor-pointer pt-3 px-2 font-semibold">See all</span>
      </div>

      <div className="relative w-full" style={{ height: containerHeight || 'auto' }}>
        {sampleData.map((item, index) => (
          <div 
            key={item.id} 
            ref={index === 0 ? cardRef : null}
            className="absolute w-full transition-all duration-300"
            style={{
              bottom: `${index * stackOffset}px`,
              zIndex: sampleData.length - index,
            }}
          >
            <ReviewCard title={item.title} subtitle={item.subtitle} amount={item.amount} icon={item.icon} />
          </div>
        ))}
      </div>
      <div className="text-xs py-1 pr-1 bg-gray-50 border border-gray-200 rounded-b-xl border-t-0 text-primary text-center">swipe right to add &nbsp; &rarr;</div>
    </div>
  );
};

export default ReviewList;
