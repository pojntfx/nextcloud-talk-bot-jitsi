'use strict';
const protoLoader = require('@grpc/proto-loader');
const grpcLibrary = require('@grpc/grpc-js');

const protoLoaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

function loadProtoFile (file) {
  const packageDefinition = protoLoader.loadSync(file, protoLoaderOptions);
  const pkg = grpcLibrary.loadPackageDefinition(packageDefinition);

  return pkg;
}

module.exports = { loadProtoFile };
