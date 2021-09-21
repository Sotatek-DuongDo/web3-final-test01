import { usePromiseTracker } from "react-promise-tracker";
import { BarLoader } from "react-spinners";

const Spinner = (props) => {
    const { promiseInProgress } = usePromiseTracker({ area: props.area });

    return (
        promiseInProgress && (
            <div className="spinner" style={{ width: '100vw', height: '100vh' }}>
                <BarLoader color="#1D8BF1" height="5" width="100%" />
            </div>
        )
    );
};
export default Spinner;