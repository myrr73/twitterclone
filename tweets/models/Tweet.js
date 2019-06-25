module.exports = (connection, DataTypes) => {
  return connection.define('tweet', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      // topic : {
      //   type: DataTypes.STRING(255),
      //   allowNull:false
      // },
      content: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    })
  
}