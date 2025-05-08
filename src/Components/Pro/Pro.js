import React, { useState, useEffect } from "react";
import { useStore } from "../../Store/store";
import api from "../../api";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../Pro/Pro.css";

const Pro = ({ chartType = "bar" }) => {
  const { myProfile, friends, myProfileGroups, myProfileAcceptedGroups } = useStore();
  const [proData, setProData] = useState([]);
  const [time, setTime] = useState([]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.online === 1 ||
      friend.away === 1 ||
      friend.do_not_disturb === 1 ||
      friend.offline === 1
  );

  const onlineCount = filteredFriends.filter(
    (friend) => friend.online === 1
  ).length;
  const awayCount = filteredFriends.filter(
    (friend) => friend.away === 1
  ).length;
  const doNotDisturbCount = filteredFriends.filter(
    (friend) => friend.do_not_disturb === 1
  ).length;
  const offlineCount = filteredFriends.filter(
    (friend) => friend.offline === 1
  ).length;

  useEffect(() => {
    if (!myProfile || !friends) return;

    const fetchProVersion = async () => {
      try {
        const response = await api.get("/pro/latest");
        setProData(response.data);
      } catch (error) {
        console.error(error, "error fetching pro version data");
      }
    };

    fetchProVersion();

    const getSpentTime = async () => {
      try {
        const response = await api.get("/online-times");
        setTime(response.data);
      } catch (error) {
        console.error(error, "Error fetching data");
        throw error;
      }
    };

    getSpentTime();
  }, [myProfile]);

  const data = [
    { name: "Online", value: onlineCount },
    { name: "Away", value: awayCount },
    { name: "DND", value: doNotDisturbCount },
    { name: "Offline", value: offlineCount },
  ];

  const groupData = [
    { name: 'Owner', value: myProfileGroups.length},
    { name: 'Accepted', value: myProfileAcceptedGroups.length},
  ];

  const COLORS = ["#27ae60", "#7f8c8d", "#c0392b", "#FFBB28"];

  return (
    <div className="pro-version-container">
      {chartType === "bar" && time.length > 0 && (
        <>
          <div className="pro-version-responsive-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={time}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${(value * 60).toFixed(0)} min`,
                    "Time Spent",
                  ]}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pro-total-friends-tracker">
            Total Time Spent:{" "}
            {(time.reduce((acc, cur) => acc + cur.value, 0) * 60).toFixed(0)}{" "}
            minutes
          </div>
        </>
      )}
      {chartType === "pie" && (
        <>
         {friends.length >= 1 ? (
             <div className="pro-piechart-container">
             <ResponsiveContainer width="100%" height={300}>
               <PieChart>
                 <Pie
                   data={data}
                   cx="30%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {data.map((entry, index) => (
                     <Cell
                       key={`cell-${index}`}
                       fill={COLORS[index % COLORS.length]}
                     />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="pro-total-completed-tasks">
               Friends: {friends.length}
             </div>
             <div className="status-legend">
               <div className="status-legend-grid">
                 {data.map((item, index) => (
                   <div key={index} className="status-item">
                     <div
                       className="status-color-box"
                       style={{ backgroundColor: COLORS[index % COLORS.length] }}
                     ></div>
                     <span className="status-name">
                       {item.name} - {item.value}
                     </span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         ) : (
            <div className="pro-piechart-container">
                <div className="header-fallback">
                    <h3>No friends</h3>
                </div>
            </div>
         )} 
        </>
      )}
        {chartType === "piegroups" && (
        <div className="pro-piechart-container">
          {myProfileGroups.length > 0 || myProfileAcceptedGroups.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={groupData}
                    cx="30%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {groupData.map((entry, index) => (
                      <Cell key={`cell-group-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pro-total-completed-tasks">
                Total Groups: {myProfileGroups.length + myProfileAcceptedGroups.length}
              </div>
              <div className="status-legend">
                <div className="status-legend-flex">
                  {groupData.map((item, index) => (
                    <div key={index} className="status-item">
                      <div
                        className="status-color-box"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="status-name">
                        {item.name} - {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="header-fallback">
              <h3>No groups</h3>
            </div>
          )}
        </div>
       )}
    </div>
  );
};

export default Pro;
